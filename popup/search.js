browser.search.get().then(installedEngines);

let engineselection = [];

function search(tab) {
  for (selected of engineselection) {
    browser.search.search({
      query: document.getElementById("searchbox").value,
      engine: selected,
      tabId: tab.id
    });
  }
}

browser.browserAction.onClicked.addListener(search);

function saveselection() {
  try {
    localStorage.removeItem('defaultengines');
  } catch {}
    localStorage.setItem('defaultengines', engineselection);
}

function installedEngines(engines) {
  for (engine of engines) {
    let checkbox = document.createElement("INPUT");
    checkbox.type = "checkbox";
    checkbox.setAttribute('value', 'engine ' + engine.name);
    try {
      let defaultengines = localStorage.getItem('defaultengines').split(",");
      for (eng of defaultengines) {
        if (engine.name == eng) checkbox.checked = true;
      }
    }
    catch {}

    let label = document.createElement('label');
    label.appendChild(document.createTextNode(engine.name));
    document.getElementById("boxes").appendChild(checkbox);
    document.getElementById("boxes").appendChild(label);

    let br = document.createElement("BR");
    document.getElementById("boxes").appendChild(br)
  }
}

document.addEventListener("click", (e) => {
  engineselection = [];
  for (engine of document.getElementsByTagName('INPUT')) {
    if (engine.value.includes("engine") && engine.checked) engineselection.push(engine.value.slice(7));
  }
  if (e.target.classList.contains("search")) {
    browser.tabs.query({active: true, currentWindow: true})
    .then(search);
  } else if (e.target.classList.contains("default")) {
    browser.tabs.query({active: true, currentWindow: true})
    .then(saveselection);
  } else if (e.target.classList.contains("image")) {
    browser.tabs.query({active: true, currentWindow: true})
    .then(searchimage);
  }
});
