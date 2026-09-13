// This is the main app controller. It captures the uploaded file, runs it through the translator, and triggers browser download

import Alpine from "alpinejs";
import { formatMyCalendarTxt } from "./src/formatjson";

Alpine.data('fileUpload', () => ({
  file: null,
  error: false,
  fileToDownload: null,

  //code to execute when a file has been uploaded
  async onUpload(event) {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    this.error = false;
    this.file = uploadedFile;

    try {
      //we extract the text
      const textContent = await uploadedFile.text();
      //call to the conversion logic to create the csv raw data
      const csvResult = await formatMyCalendarTxt(textContent);
      //we create a csv blob for the raw data
      const blob = new Blob([csvResult], { type: 'text/csv;charset=utf-8;' });
      //this csv blob is the file the user wants to download
      this.fileToDownload = URL.createObjectURL(blob);
    } catch (err) {
      //if there is an error during any of the previous steps, make it known
      console.error("Conversion failed:", err);
      this.error = true;
      this.file = null;
      this.fileToDownload = null;
    }
  },

  //helper function to make the file download into the users computer
  downloadCSV() {
    const link = document.createElement('a');
    link.href = this.fileToDownload;
    link.download = 'drip-data.csv';
    link.click();
  }
}));

Alpine.start();
