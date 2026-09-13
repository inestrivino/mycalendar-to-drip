# My Calendar to Drip

A simple tool that allows you to upload an export txt file from [My Calendar](https://play.google.com/store/apps/details?id=com.popularapp.periodcalendar) and converts it into a CSV file that can be read by Open-Source period tracker [drip](https://bloodyhealth.gitlab.io/).

## Contributing

Everyone is welcome to contribute or report errors.

To obtain a local copy of this web application:
[NPM](https://www.npmjs.com/) must be installed in the user's computer. Then in your terminal run the commands below.

```sh
git clone git@github.com:inestrivino/mycalendar-to-drip.git
cd mycalendar-to-drip
npm i
npm run dev
```

Then go to `localhost:5173` on your preferred web browser.

To add new features, make improvements, or report errors in conversion, please open an issue on the Github repository. When reporting errors in conversion, please provide the text line that was not properly converted and what you consider it should have converted to.

## Conversion method

My Calendar has features that Drip does not. This means that some data may be lost in translation, as there is no Drip equivalent value. This includes, among other values, symptom intensity.
There is also no conversion for medicine or contraceptive use yet, although it may be added in a future update of the application.

You can read about the conversion choices this app makes in [the conversion rules file](conversionrules.md).

## Data collection notice

This app is designed to handle personal health data. The website is completely client-side and does not store or send the data received anywhere. It does not contain any external calls (yes, including Google Fonts). The website is provided as a simple access option for non-tech-savvy users, however, for maximum privacy, installing and running this project locally is possible and recommended. Follow the instructions in the [Contributing](#contributing) section of this file to obtain a local copy.
The website is hosted on Github Pages, which stores, for each visit, the IP address and time of visit. Running the project locally prevents this. If you have installed plugins in your web browser that log or keep information about your web visits, consider disabling them before procceeding.

## Authors and license

This project is based on the original [flo-to-drip](https://github.com/SaraVieira/flo-to-drip) conversor my [Sara Viera](https://github.com/SaraVieira).
A similar project already exists, called [period-tracker-to-drip](https://github.com/irrediated/period-tracker-to-drip), by [irrediated](https://github.com/irrediated). However, it does not seem to have left the draft phase and has not been maintained, prompting this project. No code from irrediated's project was used.

MIT License, see the included [License.md](License.md) file.
