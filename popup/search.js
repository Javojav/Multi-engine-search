document.getElementById("searchbox").focus();

browser.search.get().then(engines => {
  for (engine of engines) {
    let checkbox = document.createElement("INPUT");
    checkbox.type = "checkbox";
    checkbox.setAttribute('value', 'engine ' + engine.name);
    try {
      let defaultengines = localStorage.getItem('defaultengines').split(",");
      for (eng of defaultengines) {
        if (engine.name == eng) checkbox.checked = true;
      }
    } catch {}
    let label = document.createElement('label');
    label.appendChild(document.createTextNode(engine.name));
    document.getElementById("boxes").appendChild(checkbox);
    document.getElementById("boxes").appendChild(label);
    document.getElementById("boxes").appendChild(document.createElement("BR"))
  }
});

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

const engineselection = () => {
  let selection = [];
  for (engine of document.getElementsByTagName('INPUT')) {
    if (engine.value.includes("engine") && engine.checked) selection.push(engine.value.slice(7));
  }
  return selection;
}

const saveselection = () => {
  try {
    localStorage.removeItem('defaultengines');
  } catch {}
    localStorage.setItem('defaultengines', engineselection());
}


document.getElementById("searchbox").addEventListener("keypress", key => {
  if (event.key == "Enter") search();
});

document.addEventListener("click", e => {
  if (e.target.classList.contains("search")) search();
  else if (e.target.classList.contains("default")) saveselection();
});
