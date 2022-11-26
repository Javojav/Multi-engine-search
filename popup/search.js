document.getElementById("searchbox").focus();

const populateengines = (engines) => {
  for (engine of engines) {
    let checkbox = document.createElement("INPUT");
    checkbox.type = "checkbox";
    checkbox.setAttribute('value', 'engine ' + engine.name);
    checkbox.id = engine.name.replace(' ', '-');
    let label = document.createElement('label');
    label.appendChild(document.createTextNode(engine.name));
    document.getElementById("boxes").appendChild(checkbox);
    document.getElementById("boxes").appendChild(label);
    document.getElementById("boxes").appendChild(document.createElement("BR"))
  }

  populatepresets();
  try { enablepresetbyname(localStorage.getItem('defaultPreset')); } catch {}
}

const populatepresets = () => {
  let presetDropdown = document.getElementById("presets");
  let presets = Array();
  try { presets = localStorage.getItem('presets').split(','); } catch {}

  while (presetDropdown.firstChild) {
    presetDropdown.removeChild(presetDropdown.lastChild);
  }

  let noPreset = document.createElement("OPTION");
  noPreset.setAttribute('value', 'noPreset');
  noPreset.innerText = '—';
  presetDropdown.appendChild(noPreset);

  for (presetName of presets) {
    let option = document.createElement("OPTION");
    option.setAttribute('value', presetName);
    option.innerText = presetName;
    presetDropdown.appendChild(option);
  }

  let newPreset = document.createElement("OPTION");
  newPreset.setAttribute('value', 'newPreset');
  newPreset.innerText = 'Create new preset…';
  presetDropdown.appendChild(newPreset);
}

const search = tab => {
  browser.tabs.query({active: true, currentWindow: true})
    .then(() => {
      for (selected of engineselection()) {
        browser.search.search({
          query: document.getElementById("searchbox").value,
          engine: selected,
        });
      }
    }
         );
}

const enablepresetbyname = (name) => {
  document.getElementById("presets").value = name;
  try { enablepreset(localStorage.getItem('preset_' + name)); }
  catch {}
}

const enablepreset = (preset) => {
  deselectengines();
  for (engine of preset.split(",")) {
    let checkbox = document.getElementById(engine.replace(' ', '-'));
    checkbox.checked = true;
  }
}

const savepreset = (preset, name) => {
  let presets = Array();
  let presetName = name.replace(',', ' ');
  try { presets = localStorage.getItem('presets').split(','); } catch {}

  try { localStorage.removeItem('preset_' + presetName); } catch {}

  presets = removefromarray(removeredundantitems(presets), presetName);
  presets.push(presetName);

  localStorage.setItem('preset_' + presetName, preset);
  localStorage.setItem('presets', presets);

  // Update UI & listed presets
  resetsearchbox(true);
  populatepresets();
  enablepresetbyname(name);
}

const removecurrentpreset = () => {
  let presetName = document.getElementById("presets").value;
  if (presetName == "noPreset" || presetName == "newPreset")
    return;

  try {
    let presets = localStorage.getItem('presets').split(',');
    localStorage.removeItem('preset_' + presetName);
    localStorage.setItem('presets', removefromarray(presets, presetName));
  }
  catch {}

  deselectengines();
  populatepresets();
  document.getElementById("presets").value = "noPreset";
}


// Search-box is also used for setting the name of new
// presets; this sets the placeholder accordingly
const searchboxaspresetname = () => {
  let textbox = document.getElementById("searchbox");
  textbox.setAttribute("placeholder", "New preset name…");
  deselectengines();
}

const resetsearchbox = (clearText = false) => {
  let textbox = document.getElementById("searchbox");
  textbox.setAttribute("placeholder", "Search…");
  if (clearText)
    textbox.value = '';
}

const deselectengines = () => {
  for (checkbox of document.getElementsByTagName("INPUT"))
    checkbox.checked = false;
}

const engineselection = () => {
  let selection = [];
  for (engine of document.getElementsByTagName('INPUT')) {
    if (engine.value.includes("engine") && engine.checked) selection.push(engine.value.slice(7));
  }
  return selection;
}

const saveselection = () => {
  let textbox = document.getElementById("searchbox");
  let selection = document.getElementById("presets").value;
  let name = selection;

  if (selection == "newPreset")
    name = textbox.value;
  savepreset(engineselection(), name);
}

const onpresetselected = (value) => {
  if (value != "newPreset")
    localStorage.setItem("defaultPreset", value);
  resetsearchbox();

  if (value == "noPreset")
    deselectengines();
  else if (value == "newPreset")
    searchboxaspresetname();
  else
    enablepresetbyname(value);

  document.getElementById("searchbox").focus();
}

const removefromarray = (array, item) => {
  return array.filter((testItem, index) =>
    {
      return testItem != item;
    });
}

const removeredundantitems = (array) => {
  return array.filter((item, index) =>
    {
      return (array.indexOf(item) === index);
    })
}

browser.search.get().then(populateengines);

document.getElementById("searchbox").addEventListener("keypress", key => {
  if (event.key == "Enter") search();
});

document.addEventListener("click", e => {
  if (e.target.classList.contains("search"))
    search();
  else if (e.target.classList.contains("save"))
    saveselection();
  else if (e.target.classList.contains("remove"))
    removecurrentpreset();
  else if (e.target.tagName == "OPTION") {
    onpresetselected(e.target.getAttribute("value"));
  }
});
