# My Calendar to Drip

A simple tool that allows you to upload an export txt file from [My Calendar](https://play.google.com/store/apps/details?id=com.popularapp.periodcalendar) and converts it into a CSV file that can be read by Open-Source period tracker [drip](https://bloodyhealth.gitlab.io/).

## Contributing

Everyone is welcome to contribute.
Please follow the instructions below to get a working local copy of the project. Create a pull request for code review when done.

## Using locally

This app is designed to handle personal health data. The creator is not responsible for any data leaks caused by the website's hosting provider (Github Pages) or browser plugins the user may have installed. The website is completely client-side and does not store or send the data received anywhere (other than offering the user a CSV file to download at the end of conversion). The website is provided as a simple access option for non-tech-savvy users, however, for maximum privacy, installing and running this project locally is recommended.

[NPM](https://www.npmjs.com/) must be installed in the user's computer.

To run the website locally do:

```sh
git clone git@github.com:inestrivino/mycalendar-to-drip.git
cd mycalendar-to-drip
npm i
npm run dev
```

Then go to `localhost:5173` on your preferred navigator.

## Authors and license

This project is based on the original [flo-to-drip](https://github.com/SaraVieira/flo-to-drip) conversor my [Sara Viera](https://github.com/SaraVieira).
A similar project already exists, called [period-tracker-to-drip](https://github.com/irrediated/period-tracker-to-drip), by [irrediated](https://github.com/irrediated). However, it does not seem to have left the draft phase and has not been maintained, prompting this project. No code from irrediated's project was used.

MIT License, see the included [License.md](License.md) file.
