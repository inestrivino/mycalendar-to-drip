// This is the main app controller. It captures the uploaded file, runs it through the translator, and triggers browser download

import Alpine from "alpinejs";

import { saveAs } from "file-saver";
import { formatFloJson } from "./src/formatjson";

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result); // desired file content
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });

//initializes a reactive state object for 3 properties
Alpine.data("fileUpload", () => ({
  //uploaded user file
  file: null,
  //generated csv file
  fileToDownload: false,
  //boolean in case the conversion fails
  error: null,

  async onUpload({ target }) {
    try {
      this.file = target.files[0];
      const json = await readFile(target.files[0]);
      const readyData = await formatFloJson(JSON.parse(json));
      this.fileToDownload = readyData;
    } catch {
      this.file = null;
      this.error = true;
    }
  },
  //force download of csv file as 'drip.csv'
  downloadCSV() {
    const blob = new Blob([this.fileToDownload], {
      type: "text/csv;charset=utf-8",
    });
    saveAs(blob, "drip.csv");
  },
}));

Alpine.start();
