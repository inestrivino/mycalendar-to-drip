# Conversion rules

| My Calendar Source | Drip Destination Column / Mapping | Notes / Transformation Rule |
| --- | --- | --- |
| **Date** | `date` | Direct format mapping (YYYY-MM-DD). |
| **Temperature** | `temperature.value` | Extracts numerical temperature value. |
| **Flow** | `bleeding.value` | Maps My Calendar intensity levels (e.g., `+Flow` to `1`, `++Flow` to `2`, `+++Flow` to `3`, `++++Flow` to `4`). |
| **Cervical mucus (Dry, Sticky, Creamy, Watery, Egg White)** | `mucus.texture` / `mucus.value` | Maps consistency/texture descriptors to Drip mucus attributes. |
| **Cervical opening** | `cervix.opening` | Translates open/closed observations to Drip's cervix opening scale. |
| **Cervical firmness** | `cervix.firmness` | Translates firm/soft observations to Drip's cervix firmness scale. |
| **Intercourse** | `sex.partner`, `sex.none`, `sex.condom=false/true` | Maps relations, and whether barrier protection was used. |
| **Ovulation Test** | `note.value` | Logs positive/negative ovulation test results into daily notes. |
| **Note** | `note.value` | Directs text copy into the daily note field. |
| **Weight** | `note.value` | Appends weight measurements into `note.value`. |
| **Pain Symptoms (Cramps, Headaches, Backaches, Nausea, Tender Breasts, Migraines)** | `pain.cramps`, `pain.headache`, `pain.backache`, `pain.nausea`, `pain.tenderBreasts`, `pain.migraine`, `pain.other` | Maps specific pain entries to respective columns in Drip; unlisted pains are combined into `pain.note`. |
| **Moods (Happy, Sad, Stressed, Anxious, Fatigue, Angry, etc.)** | `mood.happy`, `mood.sad`, `mood.stressed`, `mood.anxious`, `mood.energetic`, `mood.fatigue`, `mood.angry`, `mood.other` | Maps emotional states to corresponding Drip mood categories; unlisted moods are combined into `mood.note`. |
