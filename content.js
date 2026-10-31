// ---------------------------------------------------------------
// Content bundled with the app: reminders, quotes, day nudges, breathing modes.
// Nothing here is fetched at run time. Add your own items to any list.
//
// REMINDERS: ayat and hadith. Every item carries `ref` so it can be checked.
//   Ayat are the Uthmani text with the Sahih International meaning (Quran.com / Tanzil numbering).
//   Hadith are excerpts quoted exactly from the English translation, numbered as on sunnah.com.
//   Where the excerpt skips words, the gap is shown as " … ". Sunan items carry their `grade`.
// QUOTES: real quotes with the person's name. Each was matched against that person's own sourced quotes on Wikiquote (misattributed and disputed sections excluded).
//   Add yours as { id, cat, text, by } with cat one of: discipline, craft, learning, training.
// ---------------------------------------------------------------

const REMINDERS = [
{ id: "q2_153", kind: "ayah", theme: "patience", ref: "Quran 2:153", surah: "Al-Baqara", ar: "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّٰبِرِينَ", en: "O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient." },
 { id: "q39_10", kind: "ayah", theme: "patience", ref: "Quran 39:10", surah: "Az-Zumar", ar: "قُلْ يَٰعِبَادِ ٱلَّذِينَ ءَامَنُوا۟ ٱتَّقُوا۟ رَبَّكُمْ ۚ لِلَّذِينَ أَحْسَنُوا۟ فِى هَٰذِهِ ٱلدُّنْيَا حَسَنَةٌۭ ۗ وَأَرْضُ ٱللَّهِ وَٰسِعَةٌ ۗ إِنَّمَا يُوَفَّى ٱلصَّٰبِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍۢ", en: "Say, \"O My servants who have believed, fear your Lord. For those who do good in this world is good, and the earth of Allah is spacious. Indeed, the patient will be given their reward without account.\"" },
 { id: "q94_5", kind: "ayah", theme: "patience", ref: "Quran 94:5-6", surah: "Ash-Sharh", ar: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا إِنَّ مَعَ ٱلْعُسْرِ يُسْرًۭا", en: "For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease." },
 { id: "q3_200", kind: "ayah", theme: "patience", ref: "Quran 3:200", surah: "Aal-i-Imraan", ar: "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱصْبِرُوا۟ وَصَابِرُوا۟ وَرَابِطُوا۟ وَٱتَّقُوا۟ ٱللَّهَ لَعَلَّكُمْ تُفْلِحُونَ", en: "O you who have believed, persevere and endure and remain stationed and fear Allah that you may be successful." },
 { id: "q103_1", kind: "ayah", theme: "time", ref: "Quran 103:1-3", surah: "Al-Asr", ar: "وَٱلْعَصْرِ إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ", en: "By time, Indeed, mankind is in loss, Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience." },
 { id: "q14_7", kind: "ayah", theme: "gratitude", ref: "Quran 14:7", surah: "Ibrahim", ar: "وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِى لَشَدِيدٌۭ", en: "And [remember] when your Lord proclaimed, 'If you are grateful, I will surely increase you [in favor]; but if you deny, indeed, My punishment is severe.'" },
 { id: "q2_152", kind: "ayah", theme: "gratitude", ref: "Quran 2:152", surah: "Al-Baqara", ar: "فَٱذْكُرُونِىٓ أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ", en: "So remember Me; I will remember you. And be grateful to Me and do not deny Me." },
 { id: "q55_13", kind: "ayah", theme: "gratitude", ref: "Quran 55:13", surah: "Ar-Rahmaan", ar: "فَبِأَىِّ ءَالَآءِ رَبِّكُمَا تُكَذِّبَانِ", en: "So which of the favors of your Lord would you deny?" },
 { id: "q16_18", kind: "ayah", theme: "gratitude", ref: "Quran 16:18", surah: "An-Nahl", ar: "وَإِن تَعُدُّوا۟ نِعْمَةَ ٱللَّهِ لَا تُحْصُوهَآ ۗ إِنَّ ٱللَّهَ لَغَفُورٌۭ رَّحِيمٌۭ", en: "And if you should count the favors of Allah, you could not enumerate them. Indeed, Allah is Forgiving and Merciful." },
 { id: "q20_14", kind: "ayah", theme: "prayer", ref: "Quran 20:14", surah: "Taa-Haa", ar: "إِنَّنِىٓ أَنَا ٱللَّهُ لَآ إِلَٰهَ إِلَّآ أَنَا۠ فَٱعْبُدْنِى وَأَقِمِ ٱلصَّلَوٰةَ لِذِكْرِىٓ", en: "Indeed, I am Allah. There is no deity except Me, so worship Me and establish prayer for My remembrance." },
 { id: "q29_45", kind: "ayah", theme: "prayer", ref: "Quran 29:45", surah: "Al-Ankaboot", ar: "ٱتْلُ مَآ أُوحِىَ إِلَيْكَ مِنَ ٱلْكِتَٰبِ وَأَقِمِ ٱلصَّلَوٰةَ ۖ إِنَّ ٱلصَّلَوٰةَ تَنْهَىٰ عَنِ ٱلْفَحْشَآءِ وَٱلْمُنكَرِ ۗ وَلَذِكْرُ ٱللَّهِ أَكْبَرُ ۗ وَٱللَّهُ يَعْلَمُ مَا تَصْنَعُونَ", en: "Recite, [O Muhammad], what has been revealed to you of the Book and establish prayer. Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater. And Allah knows that which you do." },
 { id: "q23_1", kind: "ayah", theme: "prayer", ref: "Quran 23:1-2", surah: "Al-Muminoon", ar: "قَدْ أَفْلَحَ ٱلْمُؤْمِنُونَ ٱلَّذِينَ هُمْ فِى صَلَاتِهِمْ خَٰشِعُونَ", en: "Certainly will the believers have succeeded: They who are during their prayer humbly submissive" },
 { id: "q2_45", kind: "ayah", theme: "prayer", ref: "Quran 2:45", surah: "Al-Baqara", ar: "وَٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ ۚ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى ٱلْخَٰشِعِينَ", en: "And seek help through patience and prayer, and indeed, it is difficult except for the humbly submissive [to Allah]" },
 { id: "q13_28", kind: "ayah", theme: "dhikr", ref: "Quran 13:28", surah: "Ar-Ra'd", ar: "ٱلَّذِينَ ءَامَنُوا۟ وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ ٱللَّهِ ۗ أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ", en: "Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured." },
 { id: "q33_41", kind: "ayah", theme: "dhikr", ref: "Quran 33:41-42", surah: "Al-Ahzaab", ar: "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱذْكُرُوا۟ ٱللَّهَ ذِكْرًۭا كَثِيرًۭا وَسَبِّحُوهُ بُكْرَةًۭ وَأَصِيلًا", en: "O you who have believed, remember Allah with much remembrance And exalt Him morning and afternoon." },
 { id: "q50_39", kind: "ayah", theme: "dhikr", ref: "Quran 50:39", surah: "Qaaf", ar: "فَٱصْبِرْ عَلَىٰ مَا يَقُولُونَ وَسَبِّحْ بِحَمْدِ رَبِّكَ قَبْلَ طُلُوعِ ٱلشَّمْسِ وَقَبْلَ ٱلْغُرُوبِ", en: "So be patient, [O Muhammad], over what they say and exalt [Allah] with praise of your Lord before the rising of the sun and before its setting," },
 { id: "q25_63", kind: "ayah", theme: "character", ref: "Quran 25:63", surah: "Al-Furqaan", ar: "وَعِبَادُ ٱلرَّحْمَٰنِ ٱلَّذِينَ يَمْشُونَ عَلَى ٱلْأَرْضِ هَوْنًۭا وَإِذَا خَاطَبَهُمُ ٱلْجَٰهِلُونَ قَالُوا۟ سَلَٰمًۭا", en: "And the servants of the Most Merciful are those who walk upon the earth easily, and when the ignorant address them [harshly], they say [words of] peace," },
 { id: "q41_34", kind: "ayah", theme: "character", ref: "Quran 41:34", surah: "Fussilat", ar: "وَلَا تَسْتَوِى ٱلْحَسَنَةُ وَلَا ٱلسَّيِّئَةُ ۚ ٱدْفَعْ بِٱلَّتِى هِىَ أَحْسَنُ فَإِذَا ٱلَّذِى بَيْنَكَ وَبَيْنَهُۥ عَدَٰوَةٌۭ كَأَنَّهُۥ وَلِىٌّ حَمِيمٌۭ", en: "And not equal are the good deed and the bad. Repel [evil] by that [deed] which is better; and thereupon the one whom between you and him is enmity [will become] as though he was a devoted friend." },
 { id: "q7_199", kind: "ayah", theme: "character", ref: "Quran 7:199", surah: "Al-A'raaf", ar: "خُذِ ٱلْعَفْوَ وَأْمُرْ بِٱلْعُرْفِ وَأَعْرِضْ عَنِ ٱلْجَٰهِلِينَ", en: "Take what is given freely, enjoin what is good, and turn away from the ignorant." },
 { id: "q17_24", kind: "ayah", theme: "parents", ref: "Quran 17:24", surah: "Al-Israa", ar: "وَٱخْفِضْ لَهُمَا جَنَاحَ ٱلذُّلِّ مِنَ ٱلرَّحْمَةِ وَقُل رَّبِّ ٱرْحَمْهُمَا كَمَا رَبَّيَانِى صَغِيرًۭا", en: "And lower to them the wing of humility out of mercy and say, \"My Lord, have mercy upon them as they brought me up [when I was] small.\"" },
 { id: "q49_13", kind: "ayah", theme: "character", ref: "Quran 49:13", surah: "Al-Hujuraat", ar: "يَٰٓأَيُّهَا ٱلنَّاسُ إِنَّا خَلَقْنَٰكُم مِّن ذَكَرٍۢ وَأُنثَىٰ وَجَعَلْنَٰكُمْ شُعُوبًۭا وَقَبَآئِلَ لِتَعَارَفُوٓا۟ ۚ إِنَّ أَكْرَمَكُمْ عِندَ ٱللَّهِ أَتْقَىٰكُمْ ۚ إِنَّ ٱللَّهَ عَلِيمٌ خَبِيرٌۭ", en: "O mankind, indeed We have created you from male and female and made you peoples and tribes that you may know one another. Indeed, the most noble of you in the sight of Allah is the most righteous of you. Indeed, Allah is Knowing and Acquainted." },
 { id: "q63_9", kind: "ayah", theme: "time", ref: "Quran 63:9", surah: "Al-Munaafiqoon", ar: "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تُلْهِكُمْ أَمْوَٰلُكُمْ وَلَآ أَوْلَٰدُكُمْ عَن ذِكْرِ ٱللَّهِ ۚ وَمَن يَفْعَلْ ذَٰلِكَ فَأُو۟لَٰٓئِكَ هُمُ ٱلْخَٰسِرُونَ", en: "O you who have believed, let not your wealth and your children divert you from remembrance of Allah. And whoever does that - then those are the losers." },
 { id: "q7_31", kind: "ayah", theme: "health", ref: "Quran 7:31", surah: "Al-A'raaf", ar: "۞ يَٰبَنِىٓ ءَادَمَ خُذُوا۟ زِينَتَكُمْ عِندَ كُلِّ مَسْجِدٍۢ وَكُلُوا۟ وَٱشْرَبُوا۟ وَلَا تُسْرِفُوٓا۟ ۚ إِنَّهُۥ لَا يُحِبُّ ٱلْمُسْرِفِينَ", en: "O children of Adam, take your adornment at every masjid, and eat and drink, but be not excessive. Indeed, He likes not those who commit excess." },
 { id: "q28_26", kind: "ayah", theme: "strength", ref: "Quran 28:26", surah: "Al-Qasas", ar: "قَالَتْ إِحْدَىٰهُمَا يَٰٓأَبَتِ ٱسْتَـْٔجِرْهُ ۖ إِنَّ خَيْرَ مَنِ ٱسْتَـْٔجَرْتَ ٱلْقَوِىُّ ٱلْأَمِينُ", en: "One of the women said, \"O my father, hire him. Indeed, the best one you can hire is the strong and the trustworthy.\"" },
 { id: "q20_114", kind: "ayah", theme: "knowledge", ref: "Quran 20:114", surah: "Taa-Haa", ar: "فَتَعَٰلَى ٱللَّهُ ٱلْمَلِكُ ٱلْحَقُّ ۗ وَلَا تَعْجَلْ بِٱلْقُرْءَانِ مِن قَبْلِ أَن يُقْضَىٰٓ إِلَيْكَ وَحْيُهُۥ ۖ وَقُل رَّبِّ زِدْنِى عِلْمًۭا", en: "So high [above all] is Allah, the Sovereign, the Truth. And, [O Muhammad], do not hasten with [recitation of] the Qur'an before its revelation is completed to you, and say, \"My Lord, increase me in knowledge.\"" },
 { id: "q39_9", kind: "ayah", theme: "knowledge", ref: "Quran 39:9", surah: "Az-Zumar", ar: "أَمَّنْ هُوَ قَٰنِتٌ ءَانَآءَ ٱلَّيْلِ سَاجِدًۭا وَقَآئِمًۭا يَحْذَرُ ٱلْءَاخِرَةَ وَيَرْجُوا۟ رَحْمَةَ رَبِّهِۦ ۗ قُلْ هَلْ يَسْتَوِى ٱلَّذِينَ يَعْلَمُونَ وَٱلَّذِينَ لَا يَعْلَمُونَ ۗ إِنَّمَا يَتَذَكَّرُ أُو۟لُوا۟ ٱلْأَلْبَٰبِ", en: "Is one who is devoutly obedient during periods of the night, prostrating and standing [in prayer], fearing the Hereafter and hoping for the mercy of his Lord, [like one who does not]? Say, \"Are those who know equal to those who do not know?\" Only they will remember [who are] people of understanding." },
 { id: "q96_1", kind: "ayah", theme: "knowledge", ref: "Quran 96:1-5", surah: "Al-Alaq", ar: "ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ خَلَقَ ٱلْإِنسَٰنَ مِنْ عَلَقٍ ٱقْرَأْ وَرَبُّكَ ٱلْأَكْرَمُ ٱلَّذِى عَلَّمَ بِٱلْقَلَمِ عَلَّمَ ٱلْإِنسَٰنَ مَا لَمْ يَعْلَمْ", en: "Recite in the name of your Lord who created - Created man from a clinging substance. Recite, and your Lord is the most Generous - Who taught by the pen - Taught man that which he knew not." },
 { id: "q94_7", kind: "ayah", theme: "consistency", ref: "Quran 94:7-8", surah: "Ash-Sharh", ar: "فَإِذَا فَرَغْتَ فَٱنصَبْ وَإِلَىٰ رَبِّكَ فَٱرْغَب", en: "So when you have finished [your duties], then stand up [for worship]. And to your Lord direct [your] longing." },
 { id: "q15_99", kind: "ayah", theme: "consistency", ref: "Quran 15:99", surah: "Al-Hijr", ar: "وَٱعْبُدْ رَبَّكَ حَتَّىٰ يَأْتِيَكَ ٱلْيَقِينُ", en: "And worship your Lord until there comes to you the certainty (death)." },
 { id: "q98_5", kind: "ayah", theme: "intention", ref: "Quran 98:5", surah: "Al-Bayyina", ar: "وَمَآ أُمِرُوٓا۟ إِلَّا لِيَعْبُدُوا۟ ٱللَّهَ مُخْلِصِينَ لَهُ ٱلدِّينَ حُنَفَآءَ وَيُقِيمُوا۟ ٱلصَّلَوٰةَ وَيُؤْتُوا۟ ٱلزَّكَوٰةَ ۚ وَذَٰلِكَ دِينُ ٱلْقَيِّمَةِ", en: "And they were not commanded except to worship Allah, [being] sincere to Him in religion, inclining to truth, and to establish prayer and to give zakah. And that is the correct religion." },
 { id: "q6_162", kind: "ayah", theme: "intention", ref: "Quran 6:162", surah: "Al-An'aam", ar: "قُلْ إِنَّ صَلَاتِى وَنُسُكِى وَمَحْيَاىَ وَمَمَاتِى لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ", en: "Say, \"Indeed, my prayer, my rites of sacrifice, my living and my dying are for Allah, Lord of the worlds." },
 { id: "q65_3", kind: "ayah", theme: "trust", ref: "Quran 65:3", surah: "At-Talaaq", ar: "وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ ۚ إِنَّ ٱللَّهَ بَٰلِغُ أَمْرِهِۦ ۚ قَدْ جَعَلَ ٱللَّهُ لِكُلِّ شَىْءٍۢ قَدْرًۭا", en: "And will provide for him from where he does not expect. And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose. Allah has already set for everything a [decreed] extent." },
 { id: "q39_53", kind: "ayah", theme: "hope", ref: "Quran 39:53", surah: "Az-Zumar", ar: "۞ قُلْ يَٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا ۚ إِنَّهُۥ هُوَ ٱلْغَفُورُ ٱلرَّحِيمُ", en: "Say, \"O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah. Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful.\"" },
 { id: "q2_186", kind: "ayah", theme: "hope", ref: "Quran 2:186", surah: "Al-Baqara", ar: "وَإِذَا سَأَلَكَ عِبَادِى عَنِّى فَإِنِّى قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ ٱلدَّاعِ إِذَا دَعَانِ ۖ فَلْيَسْتَجِيبُوا۟ لِى وَلْيُؤْمِنُوا۟ بِى لَعَلَّهُمْ يَرْشُدُونَ", en: "And when My servants ask you, [O Muhammad], concerning Me - indeed I am near. I respond to the invocation of the supplicant when he calls upon Me. So let them respond to Me [by obedience] and believe in Me that they may be [rightly] guided." },
 { id: "q3_139", kind: "ayah", theme: "hope", ref: "Quran 3:139", surah: "Aal-i-Imraan", ar: "وَلَا تَهِنُوا۟ وَلَا تَحْزَنُوا۟ وَأَنتُمُ ٱلْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ", en: "So do not weaken and do not grieve, and you will be superior if you are [true] believers." },
 { id: "q93_3", kind: "ayah", theme: "hope", ref: "Quran 93:3-5", surah: "Ad-Dhuhaa", ar: "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ وَلَلْءَاخِرَةُ خَيْرٌۭ لَّكَ مِنَ ٱلْأُولَىٰ وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰٓ", en: "Your Lord has not taken leave of you, [O Muhammad], nor has He detested [you]. And the Hereafter is better for you than the first [life]. And your Lord is going to give you, and you will be satisfied." },
 { id: "q21_87", kind: "ayah", theme: "hope", ref: "Quran 21:87", surah: "Al-Anbiyaa", ar: "وَذَا ٱلنُّونِ إِذ ذَّهَبَ مُغَٰضِبًۭا فَظَنَّ أَن لَّن نَّقْدِرَ عَلَيْهِ فَنَادَىٰ فِى ٱلظُّلُمَٰتِ أَن لَّآ إِلَٰهَ إِلَّآ أَنتَ سُبْحَٰنَكَ إِنِّى كُنتُ مِنَ ٱلظَّٰلِمِينَ", en: "And [mention] the man of the fish, when he went off in anger and thought that We would not decree [anything] upon him. And he called out within the darknesses, \"There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.\"" },
 { id: "q112_1", kind: "ayah", theme: "dhikr", ref: "Quran 112:1-4", surah: "Al-Ikhlaas", ar: "قُلْ هُوَ ٱللَّهُ أَحَدٌ ٱللَّهُ ٱلصَّمَدُ لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ", en: "Say, \"He is Allah, [who is] One, Allah, the Eternal Refuge. He neither begets nor is born, Nor is there to Him any equivalent." },
 { id: "q2_201", kind: "ayah", theme: "dua", ref: "Quran 2:201", surah: "Al-Baqara", ar: "وَمِنْهُم مَّن يَقُولُ رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا حَسَنَةًۭ وَفِى ٱلْءَاخِرَةِ حَسَنَةًۭ وَقِنَا عَذَابَ ٱلنَّارِ", en: "But among them is he who says, \"Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.\"" },
 { id: "q17_79", kind: "ayah", theme: "night", ref: "Quran 17:79", surah: "Al-Israa", ar: "وَمِنَ ٱلَّيْلِ فَتَهَجَّدْ بِهِۦ نَافِلَةًۭ لَّكَ عَسَىٰٓ أَن يَبْعَثَكَ رَبُّكَ مَقَامًۭا مَّحْمُودًۭا", en: "And from [part of] the night, pray with it as additional [worship] for you; it is expected that your Lord will resurrect you to a praised station." },
 { id: "q51_17", kind: "ayah", theme: "night", ref: "Quran 51:17-18", surah: "Adh-Dhaariyat", ar: "كَانُوا۟ قَلِيلًۭا مِّنَ ٱلَّيْلِ مَا يَهْجَعُونَ وَبِٱلْأَسْحَارِ هُمْ يَسْتَغْفِرُونَ", en: "They used to sleep but little of the night, And in the hours before dawn they would ask forgiveness," },
{ id: "h0", kind: "hadith", theme: "intention", ref: "Sahih al-Bukhari 1", by: "Umar ibn al-Khattab", en: "The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended." },
 { id: "h1", kind: "hadith", theme: "consistency", ref: "Sahih al-Bukhari 6464", by: "Aisha", en: "The most beloved deed to Allah is the most regular and constant even if it were little" },
 { id: "h2", kind: "hadith", theme: "time", ref: "Sahih al-Bukhari 6412", by: "Ibn Abbas", en: "There are two blessings that many people are deceived into losing: health and free time." },
 { id: "h3", kind: "hadith", theme: "character", ref: "Sahih al-Bukhari 6114", by: "Abu Huraira", en: "The strong is not the one who overcomes the people by his strength, but the strong is the one who controls himself while in anger." },
 { id: "h4", kind: "hadith", theme: "character", ref: "Sahih al-Bukhari 13", by: "Anas", en: "None of you will have faith till he wishes for his (Muslim) brother what he likes for himself." },
 { id: "h5", kind: "hadith", theme: "knowledge", ref: "Sahih al-Bukhari 5027", by: "Uthman", en: "The best among you (Muslims) are those who learn the Qur'an and teach it." },
 { id: "h6", kind: "hadith", theme: "character", ref: "Sahih al-Bukhari 6018", by: "Abu Huraira", en: "Anybody who believes in Allah and the Last Day should talk what is good or keep quiet" },
 { id: "h7", kind: "hadith", theme: "dhikr", ref: "Sahih al-Bukhari 6407", by: "Abu Musa", en: "The example of the one who celebrates the Praises of his Lord (Allah) in comparison to the one who does not celebrate the Praises of his Lord, is that of a living creature compared to a dead one." },
 { id: "h8", kind: "hadith", theme: "dhikr", ref: "Sahih al-Bukhari 6405", by: "Abu Huraira", en: "Whoever says, 'Subhan Allah wa bihamdihi,' one hundred times a day, will be forgiven all his sins even if they were as much as the foam of the sea." },
 { id: "h9", kind: "hadith", theme: "patience", ref: "Sahih al-Bukhari 1469", by: "Abu Said al-Khudri", en: "Nobody can be given a blessing better and greater than patience." },
 { id: "h10", kind: "hadith", theme: "character", ref: "Sahih al-Bukhari 6094", by: "Abdullah ibn Mas'ud", en: "Truthfulness leads to righteousness, and righteousness leads to Paradise. And a man keeps on telling the truth until he becomes a truthful person." },
 { id: "h11", kind: "hadith", theme: "patience", ref: "Sahih al-Bukhari 5641", by: "Abu Said al-Khudri and Abu Huraira", en: "No fatigue, nor disease, nor sorrow, nor sadness, nor hurt, nor distress befalls a Muslim, even if it were the prick he receives from a thorn, but that Allah expiates some of his sins for that." },
 { id: "h12", kind: "hadith", theme: "character", ref: "Sahih al-Bukhari 10", by: "Abdullah ibn Amr", en: "A Muslim is the one who avoids harming Muslims with his tongue and hands." },
 { id: "h13", kind: "hadith", theme: "strength", ref: "Sahih Muslim 2664", by: "Abu Huraira", en: "A strong believer is better and is more lovable to Allah than a weak believer, and there is good in everyone, (but) cherish that which gives you benefit (in the Hereafter) and seek help from Allah and do not lose heart" },
 { id: "h14", kind: "hadith", theme: "gratitude", ref: "Sahih Muslim 223", by: "Abu Malik al-Ash'ari", en: "Cleanliness is half of faith and al-Hamdu Lillah (all praise and gratitude is for Allah alone) fills the scale" },
 { id: "h15", kind: "hadith", theme: "prayer", ref: "Sahih Muslim 223", by: "Abu Malik al-Ash'ari", en: "Prayer is a light, and charity is proof (of one's faith) and endurance is a brightness" },
 { id: "h16", kind: "hadith", theme: "patience", ref: "Sahih Muslim 2999", by: "Suhaib", en: "Strange are the ways of a believer for there is good in every affair of his … if he has an occasion to feel delight, he thanks (God), thus there is a good for him in it, and if he gets into trouble and shows resignation (and endures it patiently), there is a good for him in it" },
 { id: "h17", kind: "hadith", theme: "parents", ref: "Sahih Muslim 1631", by: "Abu Huraira", en: "When a man dies, his acts come to an end, but three, recurring charity, or knowledge (by which people) benefit, or a pious son, who prays for him (for the deceased)" },
 { id: "h18", kind: "hadith", theme: "dhikr", ref: "Sahih Muslim 720", by: "Abu Dharr", en: "Every utterance of Allah's glorification is an act of charity. Every utterance of praise of Him is an act of charity, every utterance of profession of His Oneness is an act of charity, every utterance of profession of His Greatness is an act of charity" },
 { id: "h19", kind: "hadith", theme: "intention", ref: "Sahih Muslim 2564", by: "Abu Huraira", en: "Verily Allah does not look to your faces and your wealth but He looks to your heart and to your deeds" },
 { id: "h20", kind: "hadith", theme: "knowledge", ref: "Sahih Muslim 2699", by: "Abu Huraira", en: "He who treads the path in search of knowledge, Allah would make that path easy, leading to Paradise for him" },
 { id: "h21", kind: "hadith", theme: "character", ref: "Jami at-Tirmidhi 1987", by: "Abu Dharr", en: "Have Taqwa of Allah wherever you are, and follow an evil deed with a good one to wipe it out, and treat the people with good behavior", grade: "Hasan" },
 { id: "h22", kind: "hadith", theme: "time", ref: "Jami at-Tirmidhi 2317", by: "Abu Huraira", en: "Indeed among the excellence of a person's Islam is that he leaves what does not concern him", grade: "Hasan" },
 { id: "h23", kind: "hadith", theme: "character", ref: "Jami at-Tirmidhi 2002", by: "Abu ad-Darda", en: "Nothing is heavier on the believer's Scale on the Day of Judgment than good character", grade: "Hasan" },
 { id: "h24", kind: "hadith", theme: "trust", ref: "Jami at-Tirmidhi 2517", by: "Anas ibn Malik", en: "Shall I tie it and rely(upon Allah), or leave it loose and rely(upon Allah)?\" He said: \"Tie it and rely(upon Allah).", grade: "Hasan" },
 { id: "h25", kind: "hadith", theme: "health", ref: "Jami at-Tirmidhi 2380", by: "Miqdam ibn Ma'dikarib", en: "The human does not fill any container that is worse than his stomach. It is sufficient for the son of Adam to eat what will support his back. If this is not possible, then a third for food, a third for drink, and third for his breath", grade: "Hasan" },
 { id: "h26", kind: "hadith", theme: "dhikr", ref: "Jami at-Tirmidhi 2891", by: "Abu Huraira", en: "Indeed there is a Surah in the Qur'an of thirty Ayat, which intercedes for a man until he is forgiven. It is [Surah] Tabarak Alladhi Biyadihil-Mulk", grade: "Hasan" },
 { id: "h27", kind: "hadith", theme: "character", ref: "Jami at-Tirmidhi 1956", by: "Abu Dharr", en: "Your smiling in the face of your brother is charity, commanding good and forbidding evil is charity", grade: "Hasan" },
 { id: "h28", kind: "hadith", theme: "dhikr", ref: "Jami at-Tirmidhi 3377", by: "Abu ad-Darda", en: "Should I not inform you of the best of your deed, and the purest of them with your Master, and the highest of them in your ranks … The remembrance of Allah [Most High].", grade: "Sahih" },
];

// Shown only on the day or time they belong to (see NUDGES below). Not part of the daily rotation.
const REMINDERS_CONTEXT = [
{ id: "c0", kind: "hadith", theme: "friday", ref: "Sunan Abi Dawud 1047", by: "Aws ibn Aws", en: "Among the most excellent of your days is Friday … so invoke more blessings on me that day, for your blessings will be submitted to me", grade: "Sahih" },
 { id: "c1", kind: "hadith", theme: "monday", ref: "Sahih Muslim 1162", by: "Abu Qatada al-Ansari", en: "It is (the day) when I was born and revelation was sent down to me" },
 { id: "c2", kind: "hadith", theme: "thursday", ref: "Jami at-Tirmidhi 747", by: "Abu Huraira", en: "Deeds are presented on Monday and Thursday, and I love that my deeds be presented while I am fasting", grade: "Hasan" },
 { id: "c3", kind: "hadith", theme: "night", ref: "Sahih al-Bukhari 1145", by: "Abu Huraira", en: "Our Lord, the Blessed, the Superior, comes every night down on the nearest Heaven to us when the last third of the night remains … Is there anyone seeking My forgiveness, so that I may forgive him?" },
 { id: "c4", kind: "hadith", theme: "bedtime", ref: "Sahih al-Bukhari 2311", by: "Abu Huraira", en: "Whenever you go to bed, recite \"Ayat-al-Kursi\" … Allah will appoint a guard for you who will stay with you and no satan will come near you till morning" },
];

const QUOTE_CATS = [
  { id: "discipline", name: "Discipline and habits" },
  { id: "craft", name: "Programming and craft" },
  { id: "learning", name: "Learning" },
  { id: "training", name: "Health and training" }
];

const QUOTES = [
 { id: "z0", cat: "discipline", text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", by: "Will Durant", src: "The Story of Philosophy, summing up Aristotle" },
 { id: "z1", cat: "discipline", text: "Every action you take is a vote for the person you wish to become.", by: "James Clear", src: "Atomic Habits" },
 { id: "z2", cat: "discipline", text: "The impediment to action advances action. What stands in the way becomes the way.", by: "Marcus Aurelius", src: "Meditations 5.20" },
 { id: "z3", cat: "discipline", text: "Waste no more time arguing what a good man should be. Be one.", by: "Marcus Aurelius", src: "Meditations 10.16" },
 { id: "z4", cat: "discipline", text: "You could leave life right now. Let that determine what you do and say and think.", by: "Marcus Aurelius", src: "Meditations 2.11" },
 { id: "z5", cat: "discipline", text: "It is not that we have a short space of time, but that we waste much of it.", by: "Seneca", src: "On the Shortness of Life" },
 { id: "z6", cat: "discipline", text: "We suffer more often in imagination than in reality.", by: "Seneca", src: "Letters to Lucilius 13" },
 { id: "z7", cat: "discipline", text: "If we have our own why in life, we shall get along with almost any how.", by: "Friedrich Nietzsche", src: "Twilight of the Idols" },
 { id: "z8", cat: "discipline", text: "First say to yourself what you would be; and then do what you have to do.", by: "Epictetus", src: "Discourses 3.23" },
 { id: "z9", cat: "discipline", text: "Genius is one percent inspiration, ninety-nine percent perspiration.", by: "Thomas Edison" },
 { id: "z10", cat: "craft", text: "We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil.", by: "Donald Knuth", src: "Structured Programming with go to Statements, 1974" },
 { id: "z11", cat: "craft", text: "Simplicity is prerequisite for reliability.", by: "Edsger W. Dijkstra", src: "EWD498" },
 { id: "z12", cat: "craft", text: "Program testing can be used to show the presence of bugs, but never to show their absence!", by: "Edsger W. Dijkstra", src: "Notes on Structured Programming" },
 { id: "z13", cat: "craft", text: "Everyone knows that debugging is twice as hard as writing a program in the first place.", by: "Brian Kernighan", src: "The Elements of Programming Style" },
 { id: "z14", cat: "craft", text: "Controlling complexity is the essence of computer programming.", by: "Brian Kernighan", src: "Software Tools" },
 { id: "z15", cat: "craft", text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", by: "Martin Fowler", src: "Refactoring" },
 { id: "z16", cat: "craft", text: "Talk is cheap. Show me the code.", by: "Linus Torvalds", src: "2000" },
 { id: "z17", cat: "craft", text: "Plan to throw one away; you will, anyhow.", by: "Fred Brooks", src: "The Mythical Man-Month" },
 { id: "z18", cat: "craft", text: "Adding manpower to a late software project makes it later.", by: "Fred Brooks", src: "The Mythical Man-Month" },
 { id: "z19", cat: "craft", text: "The best way to predict the future is to invent it.", by: "Alan Kay" },
 { id: "z20", cat: "craft", text: "Simple things should be simple, complex things should be possible.", by: "Alan Kay" },
 { id: "z21", cat: "craft", text: "There are two ways of constructing a software design: One way is to make it so simple that there are obviously no deficiencies, and the other way is to make it so complicated that there are no obvious deficiencies.", by: "Tony Hoare", src: "Turing Award lecture, 1980" },
 { id: "z22", cat: "craft", text: "The most dangerous phrase in the language is, 'We've always done it this way.'", by: "Grace Hopper" },
 { id: "z23", cat: "craft", text: "There are only two kinds of languages: the ones people complain about and the ones nobody uses.", by: "Bjarne Stroustrup" },
 { id: "z24", cat: "learning", text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", by: "Dr. Seuss", src: "I Can Read with My Eyes Shut!" },
 { id: "z25", cat: "learning", text: "I have no special talents. I am only passionately curious.", by: "Albert Einstein", src: "Letter to Carl Seelig, 1952" },
 { id: "z26", cat: "learning", text: "The important thing is not to stop questioning.", by: "Albert Einstein", src: "Life magazine, 1955" },
 { id: "z27", cat: "learning", text: "If I have seen further it is by standing on the shoulders of Giants.", by: "Isaac Newton", src: "Letter to Robert Hooke, 1675" },
 { id: "z28", cat: "learning", text: "What I cannot create, I do not understand.", by: "Richard Feynman", src: "Found on his blackboard, 1988" },
 { id: "z29", cat: "learning", text: "The first principle is that you must not fool yourself — and you are the easiest person to fool.", by: "Richard Feynman", src: "Caltech commencement, 1974" },
 { id: "z30", cat: "learning", text: "Learning without thought is labor lost; thought without learning is perilous.", by: "Confucius", src: "Analects 2.15" },
 { id: "z31", cat: "learning", text: "Tell me to what you pay attention and I will tell you who you are.", by: "José Ortega y Gasset" },
 { id: "z32", cat: "training", text: "Walking is the best possible exercise. Habituate yourself to walk very far.", by: "Thomas Jefferson", src: "Letter to Peter Carr, 1785" },
 { id: "z33", cat: "training", text: "I've missed over 9,000 shots in my career. I've lost almost 300 games. 26 times I've been trusted to take the game-winning shot and missed. I've failed over and over and over again in my life. And that is why I succeed.", by: "Michael Jordan", src: "Nike ad, 1997" },
 { id: "z34", cat: "training", text: "An early-morning walk is a blessing for the whole day.", by: "Henry David Thoreau" },
 { id: "z35", cat: "discipline", text: "No man is free who is not master of himself.", by: "Epictetus", src: "Fragments" },
 { id: "z36", cat: "discipline", text: "Well done is better than well said.", by: "Benjamin Franklin", src: "Poor Richard's Almanack" },
 { id: "z37", cat: "craft", text: "Given enough eyeballs, all bugs are shallow.", by: "Eric S. Raymond", src: "The Cathedral and the Bazaar" },
 { id: "z38", cat: "craft", text: "The question of whether machines can think is about as relevant as the question of whether submarines can swim.", by: "Edsger W. Dijkstra" },
 { id: "z39", cat: "craft", text: "Science is what we understand well enough to explain to a computer. Art is everything else we do.", by: "Donald Knuth", src: "A=B, foreword" },
 { id: "z40", cat: "craft", text: "A language that doesn't affect the way you think about programming, is not worth knowing.", by: "Alan Perlis", src: "Epigrams in Programming" },
];

// ---------------------------------------------------------------
// Day-specific nudges. `when` is matched by the app; `cite` points to a REMINDERS_CONTEXT id above
// (so the source is shown with it). Edit the text freely.
// ---------------------------------------------------------------
const NUDGES = [
  { when: "friday",  text: "Jumu'ah: read Surah al-Kahf and send extra salawat on the Prophet ﷺ today.", cite: "c0" },
  { when: "monday",  text: "Monday is a Sunnah fast day.", cite: "c1" },
  { when: "thursday", text: "Thursday is a Sunnah fast day.", cite: "c2" },
  { when: "lastThird", text: "Last third of the night: a time for qiyam, du'a and istighfar.", cite: "c3" },
  { when: "morning", text: "Morning adhkar are still open.", habit: "adhkar_am" },
  { when: "evening", text: "Evening adhkar are still open.", habit: "adhkar_pm" }
];

// Used to work out the last third of the night (Maghrib to Fajr) with no internet.
// Defaults are for Bishkek. Times are an approximation from the sun's position, a few minutes off at most.
// fajrAngle: 18 is the Muslim World League standard; change it if your local authority uses another.
const PLACE = { name: "Bishkek", lat: 42.8746, lon: 74.5698, fajrAngle: 18 };

// ---------------------------------------------------------------
// Breathing modes. Each step is one phase of a single breath:
//   label (shown), secs (how long), size (0 = small circle, 1 = big circle), cues (optional, rotate each breath).
// `lengths` are the choices offered, as a number of breaths.
// ---------------------------------------------------------------
const BREATH_MODES = [
  { id: "calm", name: "Calm", about: "Slow, even breathing. In 5, out 5, about 6 breaths a minute.",
    steps: [{ label: "Breathe in", secs: 5, size: 1 }, { label: "Breathe out", secs: 5, size: 0 }],
    lengths: [12, 30, 60], dflt: 30 },
  { id: "sleep", name: "Long exhale", about: "For winding down. In 4, out 8. The long out-breath settles you.",
    steps: [{ label: "Breathe in", secs: 4, size: 1 }, { label: "Breathe out slowly", secs: 8, size: 0 }],
    lengths: [10, 25, 50], dflt: 25 },
  { id: "box", name: "Box", about: "In 4, hold 4, out 4, hold 4. Steadies a busy mind.",
    steps: [{ label: "Breathe in", secs: 4, size: 1 }, { label: "Hold", secs: 4, size: 1 }, { label: "Breathe out", secs: 4, size: 0 }, { label: "Hold", secs: 4, size: 0 }],
    lengths: [8, 15, 30], dflt: 15 },
  { id: "sigh", name: "Physiological sigh", about: "Two short breaths in through the nose, one long breath out through the mouth. A quick reset after training or rolling.",
    steps: [{ label: "Short breath in (nose)", secs: 2, size: .7 }, { label: "Second sip in (nose)", secs: 1, size: 1 }, { label: "Long breath out (mouth)", secs: 6, size: 0 }],
    lengths: [3, 5], dflt: 5, unit: "rounds" },
  { id: "rib", name: "360° rib breathing", about: "Breathe into the ribs all the way around: sides, back and front. In 4, out 6.",
    steps: [
      { label: "Breathe in", secs: 4, size: 1, cues: ["Widen the ribs into your hands", "Let the pelvic floor soften on the inhale", "Fill the sides and the back"] },
      { label: "Breathe out", secs: 6, size: 0, cues: ["Let the ribs close slowly", "Let the belly settle", "Long and quiet"] }],
    lengths: [6, 12, 30], dflt: 12 }
];
