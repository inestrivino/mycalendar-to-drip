// This file contains the information to convert period-tracking data from one format to another. Main conversion logic.

import { format, min, parse } from "date-fns";
import jsonexport from "jsonexport/dist";

//map of data for each day
const daysMap = {};

//fields needed in the Drip CSV
const fields = {
  "temperature.value": "",
  "temperature.exclude": "",
  "temperature.time": "",
  "temperature.note": "",
  "bleeding.value": "",
  "bleeding.exclude": "",
  "mucus.texture": "",
  "mucus.value": "",
  "mucus.feeling": "",
  "mucus.exclude": "",
  "cervix.opening": "",
  "cervix.firmness": "",
  "cervix.position": "",
  "cervix.exclude": "",
  "note.value": "",
  "sex.partner": "",
  "sex.none": "",
  "sex.condom": "",
  "sex.solo": "",
  "sex.pill": "",
  "sex.iud": "",
  "sex.patch": "",
  "sex.ring": "",
  "sex.implant": "",
  "sex.diaphragm": "",
  "sex.other": "",
  "sex.note": "",
  "pain.cramps": "",
  "pain.headache": "",
  "pain.backache": "",
  "pain.nausea": "",
  "pain.tenderBreasts": "",
  "pain.migraine": "",
  "pain.ovulationPain": "",
  "pain.other": "",
  "pain.note": "",
  "mood.happy": "",
  "mood.sad": "",
  "mood.stressed": "",
  "mood.balanced": "",
  "mood.fine": "",
  "mood.anxious": "",
  "mood.energetic": "",
  "mood.fatigue": "",
  "mood.angry": "",
  "mood.other": "",
  "mood.note": "",
  "desire.value": "",
};

// helper function to handle jsonexport with await
const jsonToCSV = (json) =>
  new Promise((resolve, reject) => {
    jsonexport(json, (err, csv) => {
      if (err) return reject(err);
      resolve(csv);
    });
  });

//helper to parse dates flexibly (handles both "Aug 20, 2026" and "2026-08-20")
const parseFlexibleDate = (dateStr) => {
  const trimmed = dateStr.trim();
  let parsed = parse(trimmed, "MMM d, yyyy", new Date());
  if (isNaN(parsed.getTime())) {
    parsed = parse(trimmed, "yyyy-MM-dd", new Date());
  }
  return parsed;
};

//for each day, we get its date (formatted), and if it does not exist within our map of days, we add it. In any case, we return the entry in the map
const getDayEntry = (dateStr) => {
  const parsedDate = parseFlexibleDate(dateStr);
  if (isNaN(parsedDate.getTime())) {
    throw new Error(`Invalid date encountered: "${dateStr}"`);
  }
  const formattedDate = format(parsedDate, "yyyy-MM-dd");

  if (!daysMap[formattedDate]) {
    daysMap[formattedDate] = {
      date: formattedDate,
      ...fields,
    };
  }
  return daysMap[formattedDate];
};

//function that handles the conversion of symptoms
function handleSymptomConversion(dataPart, entry) {
  // Split by semicolon to evaluate each intensity group independently
  const groups = dataPart.replace(/^Symptoms:/, "").split(";");

  //list of direct mapping for symptoms
  const directMappings = {
    "Cramps": "pain.cramps",
    "Abdominal cramps": "pain.cramps",
    "Headache": "pain.headache",
    "Backaches": "pain.backache",
    "Nausea": "pain.nausea",
    "Tender Breasts": "pain.tenderBreasts",
    "Breast sensitivity": "pain.tenderBreasts",
    "Migraines": "pain.migraine",
    "Ovulation pain": "pain.ovulationPain"
  };
  //list for mucus mappings of symptoms to feeling and texture
  const mucusMappings = {
    "dry": { feeling: 0, texture: 0 },
    "sticky": { feeling: 2, texture: 0 },
    "creamy": { feeling: 2, texture: 1 },
    "watery": { feeling: 3, texture: 0 },
    "egg white": { feeling: 3, texture: 2 },
    "cottage-cheese": { feeling: 1, texture: 0 }
  };
  let matchedFeeling = null;
  let matchedTexture = null;
  //list for symptoms with no direct equivalent
  const otherSymptoms = [];

  groups.forEach(group => {
    if (!group.trim()) return;

    //count leading '+' signs to determine the intensity level for this group
    const plusMatch = group.match(/^[\+]*/);
    const intensityLevel = plusMatch ? plusMatch[0].length : 0;

    //remove leading '+' signs and split the items by comma
    const cleanGroup = group.replace(/^[\+]+/, "");
    const rawSymptoms = cleanGroup.split(",").map(s => s.trim()).filter(Boolean);

    rawSymptoms.forEach(symptom => {
      const lower = symptom.toLowerCase();
      //if the symptom is the flow intensity then we establish the equivalent bleeding value and exclude is always false
      if (lower === "flow") {
        if (intensityLevel > 0) {
          //bleeding value can't be higher than 3
          const intensityLevelNew = Math.min(intensityLevel, 3);
          entry["bleeding.value"] = intensityLevelNew.toString();
          entry["bleeding.exclude"] = "false";
        }
      }
      //if the symptom is spotting then we apply the bleeding value and exclude it from periods
      else if (lower === "spotting") {
        const currentBleeding = parseInt(entry["bleeding.value"], 10);
        if (isNaN(currentBleeding) || currentBleeding === 0) {
          entry["bleeding.value"] = "0";
          entry["bleeding.exclude"] = "true";
        }
      }
      //if there are symptoms related to mucus we map them to their corresponding values for feeling and texture
      else if (mucusMappings[lower]) {
        const currentTexture = parseInt(entry["mucus.texture"] || "0", 10);
        const currentFeeling = parseInt(entry["mucus.feeling"] || "0", 10);
        const m = mucusMappings[lower];
        matchedFeeling = m.feeling;
        matchedTexture = m.texture;
        if (isNaN(currentFeeling) || m.feeling >= currentFeeling) entry["mucus.feeling"] = m.feeling.toString();
        if (isNaN(currentTexture) || m.texture >= currentTexture) entry["mucus.texture"] = m.texture.toString();
        entry["mucus.exclude"] = "false";
      }
      //if there are cervical symptoms we map them to openness and softness
      else if (lower === "cervical opening") {
        entry["cervix.opening"] = "2";
        entry["cervix.exclude"] = "false";
      } else if (lower === "cervical firmness") {
        entry["cervix.firmness"] = "1";
        entry["cervix.exclude"] = "false";
      }
      //if the symptom has a direct equivalent in drip pain category, we set it to true
      else if (directMappings[symptom]) {
        entry[directMappings[symptom]] = "true";
      }
      //otherwise we add it to the list 
      else {
        otherSymptoms.push(symptom);
      }
    }
    );
  });

  //with the list of "other" symptoms we set pain.other to true and list them in the note
  if (otherSymptoms.length > 0) {
    entry["pain.other"] = "true";
    entry["pain.note"] = otherSymptoms.join(", ");
  }
}

//function that handles the conversion of moods
function handleMoodConversion(dataPart, entry) {
  if (!dataPart) return;

  //split by comma or semicolon to parse individual moods
  const rawMoods = dataPart.replace(/^Moods?:/i, "").split(/[,;]/).map(m => m.trim()).filter(Boolean);

  //direct mapping for drip's built-in moods
  const directMappings = {
    //happy
    "Happy": "mood.happy",
    "Excited": "mood.happy",
    "Jubilant": "mood.happy",
    "Joyful": "mood.happy",
    "Optimistic": "mood.happy",
    "In love": "mood.happy",

    //sad
    "Sad": "mood.sad",
    "Depressed": "mood.sad",
    "Miserable": "mood.sad",
    "Disappointed": "mood.sad",
    "Morose": "mood.sad",
    "Lonely": "mood.sad",
    "Emotional": "mood.sad",
    "Blue": "mood.sad",

    //stressed
    "Stressed": "mood.stressed",
    "Panicky": "mood.stressed",
    "Worried": "mood.stressed",
    "Tense": "mood.stressed",
    "Tormented": "mood.stressed",

    //balanced
    "Normal": "mood.balanced",
    "Neutral": "mood.balanced",
    "Relaxed": "mood.balanced",
    "Peaceful": "mood.balanced",
    "Good": "mood.balanced",

    //fine
    "Fine": "mood.fine",
    "Satisfied": "mood.fine",
    "Confident": "mood.fine",

    //anxious
    "Anxious": "mood.anxious",

    //energetic
    "Assertive": "mood.energetic",
    "Dynamic": "mood.energetic",
    "Playful": "mood.energetic",
    "Frisky": "mood.energetic",
    "Flirtatious": "mood.energetic",

    //fatigue
    "Exhausted": "mood.fatigue",
    "Sleepy": "mood.fatigue",
    "Ill": "mood.fatigue",
    "Forgetful": "mood.fatigue",

    //angry
    "Harsh": "mood.angry",
    "Angry": "mood.angry",
    "Frustrated": "mood.angry",
    "Evil": "mood.angry",
    "Cranky": "mood.angry",
    "Impatient": "mood.angry",
    "Mischievous": "mood.angry",
    "Furious": "mood.angry",
    "Grumpy": "mood.angry"
  };
  //list for moods with no equivalent
  const otherMoods = [];

  rawMoods.forEach(mood => {
    const matchedKey = Object.keys(directMappings).find(
      key => key.toLowerCase() === mood.toLowerCase()
    );
    //we set equivalent emotions to true, and push the others into the lits of leftovers
    if (matchedKey) {
      entry[directMappings[matchedKey]] = "true";
    } else {
      otherMoods.push(mood);
    }
  });

  //assign leftover moods to mood.other and mood.note
  if (otherMoods.length > 0) {
    entry["mood.other"] = "true";
    entry["mood.note"] = otherMoods.join(", ");
  }
}

//function that handles days in the middle of a period but in which there is no bleeding data
function handlePeriodDatesWithoutBleeding(lines) {
  //we go thorugh all lines once, and save on which days a period is marked as starting and in which it is marked as ending to save to its own list
  const periodStartDates = [];
  const periodEndDates = [];
  lines.forEach((line) => {
    const tabIndex = line.indexOf("\t");
    if (tabIndex === -1) return;
    const datePart = line.slice(0, tabIndex).trim();
    const dataPart = line.slice(tabIndex + 1).trim();
    const formattedDate = format(parse(datePart, "MMM d, yyyy", new Date()), "yyyy-MM-dd");

    if (dataPart.includes("Period Starts")) periodStartDates.push(formattedDate);
    if (dataPart.includes("Period Ends")) periodEndDates.push(formattedDate);
  });

  //since all data related to symptoms and bleeding has been handled, we do a pass through the dates contained between "periods" and if there is no bleeding data we default to medium bleeding
  const sortedStarts = [...periodStartDates].sort();
  const sortedEnds = [...periodEndDates].sort();

  //pair each start date with its corresponding end date
  sortedStarts.forEach((startDateStr) => {
    const endDateStr = sortedEnds.find((endDate) => endDate >= startDateStr);
    //if we have a matching end date, fill all intermediate dates inclusively
    if (endDateStr) {
      const currentDate = parse(startDateStr, "yyyy-MM-dd", new Date());
      const finalDate = parse(endDateStr, "yyyy-MM-dd", new Date());

      while (currentDate <= finalDate) {
        const dateKey = format(currentDate, "yyyy-MM-dd");

        //ensure the day entry exists in our daysMap
        const entry = getDayEntry(dateKey);

        //if no explicit bleeding value or spotting was recorded for this day, default to medium (2)
        if (!entry["bleeding.value"]) {
          entry["bleeding.value"] = "2";
          entry["bleeding.exclude"] = "false";
        }

        //move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  });
}

//main function to format the TXT data
export const formatMyCalendarTxt = async (fileContent) => {
  //we take the lines from the file (each line corresponds to one type of data for one day)
  const lines = fileContent.split(/\r?\n/).filter(Boolean);

  //for each line in the file, we format the data contained based on its type
  lines.forEach((line) => {
    //we get the date and get the entry for that day in the map
    const tabIndex = line.indexOf("\t");
    if (tabIndex === -1) return;
    const datePart = line.slice(0, tabIndex).trim();
    const dataPart = line.slice(tabIndex + 1).trim();
    const entry = getDayEntry(datePart);

    //we get the type of data that is included in the line by taking out : and parenthesis
    const rawTypePart = dataPart.split(":")[0];
    const type = rawTypePart.replace(/\(.*\)/, "").trim();

    //depending on what type of information, we handle it differently
    switch (type) {
      //we save the temperature numerical value to the corresponding drip entry
      case "Temperature": {
        const match = dataPart.match(/Temperature:([\d.]+)/);
        if (match) entry["temperature.value"] = match[1];
        entry["temperature.exclude"] = "false";
        break;
      }
      //we include the weight information into the notes for that day
      case "Weight": {
        const weightVal = dataPart.replace("Weight:", "").trim();
        entry["note.value"] = entry["note.value"]
          ? `${entry["note.value"]} | Weight: ${weightVal}`
          : `Weight: ${weightVal}`;
        break;
      }
      //we include the notes into the drip notes value for that day
      case "Note": {
        const noteVal = dataPart.replace("Note:", "").trim();
        entry["note.value"] = entry["note.value"]
          ? `${entry["note.value"]} | ${noteVal}`
          : noteVal;
        break;
      }
      //we include the result of the ovulation test into the drip notes value for that day
      case "Ovulation Test": {
        const testVal = dataPart.replace("Ovulation Test:", "").trim();
        const text = `Ovulation Test: ${testVal}`;
        entry["note.value"] = entry["note.value"]
          ? `${entry["note.value"]} | ${text}`
          : text;
        break;
      }
      //we match the intercourse value with the sex values from Drip. Any interourse must set the sex.partner value to true, as My Calendar does not register any other types, then we handle the protection possibilites
      case "Intercourse": {
        entry["sex.partner"] = "true";
        entry["sex.none"] = "false";
        if (dataPart.includes("With Condom")) {
          entry["sex.condom"] = "true";
        } else if (dataPart.includes("Without Condom")) {
          entry["sex.condom"] = "false";
        }
        break;
      }
      case "Symptoms": {
        handleSymptomConversion(dataPart, entry);
        break;
      }
      case "Moods": {
        handleMoodConversion(dataPart, entry);
        break;
      }
    }
  });

  handlePeriodDatesWithoutBleeding(lines);

  //we sort the entries one last time by their date (oldest first)
  const sortedEntries = Object.values(daysMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  //we turn the daysMap (which is not fully filled in a JSON format) into a CSV
  return jsonToCSV(Object.values(sortedEntries));
};
