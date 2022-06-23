
// Sort function for number fields
Array.prototype.sortNum = function(){return this.sort(function(a,b){return a - b})}

// Main data Object
const data = {
  keys: [],
  values: {},
  raw: [],
  columns: [],
  table: null
}

const clearFilter = () => {
  let selector = document.getElementById('Field');
  selector.selectedIndex = 0;
  data.table.clearFilter();
  populateValues(selector);
}

const displayImages = (id) => {
  let payload = new URLSearchParams();
  payload.append('cap', `"%${id}%"`);
  axios.post("https://searchserengeti.umn.edu//api/results.php", payload).then(function (response) {
      let sources = [];
      let types =[];
      response.data.imageData.forEach( (rec) => {
        let parts = rec.url.split('/');
        let url = `https://snapshotserengeti.s3.msi.umn.edu/${parts[0]}/${parts[1]}/${parts[2]}/${parts[0]}_${parts[2]}_${parts[3]}`;
        sources.push(url);
        types.push('image');
      });
      if(sources.length > 0){
        const lightbox = new FsLightbox();
        lightbox.props.sources = sources;
        lightbox.props.types = types;
        lightbox.open();
      }
      else {
        alert('No image data available.');
      }
  });
}

const filter = () => {
  let selector = document.getElementById('Field');
  let field = selector.options[selector.selectedIndex].value;
  selector = document.getElementById('Type');
  let type = selector.options[selector.selectedIndex].value;
  selector = document.getElementById('Value');
  let value = selector.options[selector.selectedIndex].value;
  if(value === '') {
    data.table.clearFilter();
  }
  else {
      data.table.setFilter(field, type, value);
  }
}

const populateValues = (selector) => {
  let field = selector.options[selector.selectedIndex].value;
  let values = document.getElementById('Value');
  while (values.options.length > 0) {
    values.remove(0);
  }

  let newOption = new Option('','');
  values.add(newOption,undefined);

  if(field !== '') {
    data.values[field].forEach( (val) => {
        newOption = new Option(val, val);
        values.add(newOption,undefined);
    });
  }
  else {
    data.table.clearFilter();
  }
}

Papa.parse('./Serengeti_Data_200_lines_modified.csv', {
  download: true,
  header: true,
  dynamicTyping: true,
  complete: (results) => {
    // Get the headers minus the blank index field
    data.keys = results.meta.fields.slice(1);
    data.raw = results.data;
    //Remove blank record at end
    data.raw.pop();

    // Build the key value object
    data.keys.forEach( (key) => {
      data.values[key] = [];
    });
    // Populate the key value object
    data.raw.forEach( (rec) => {
      data.keys.forEach( (key) => {
        if(data.values[key].indexOf(rec[key]) === -1) {
          data.values[key].push(rec[key]);
        }
      });
    });

    // Sort the values
    data.keys.forEach( (key) => {
      if(typeof(data.values[key][0]) === 'string'){
          data.values[key].sort();
      }
      else {
        data.values[key].sortNum();
      }


      // Column definitions -- Tabulator specific
      if(key === 'CaptureEventID') {
        data.columns.push({
          title: key,
          field: key,
          formatter: (cell, params) => {
            let value = cell.getValue();
            return `<input type="button", value="${value}" style="cursor: pointer" onClick="(() => {displayImages(this.value)})()" />`
          }
        });
      }
      else {
          data.columns.push({title: key, field: key});
      }
    });

    // Initilize and render table
    data.table = new Tabulator('#Table', {
      selectable: false,
      height: 475,
      pagination: true,
      paginationSize: 25,
      paginationCounter: 'rows',
      data: data.raw,
      columns: data.columns
    });
  }
});
