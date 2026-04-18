USE agrolink_db;

-- Chatbot categories
INSERT IGNORE INTO chatbot_categories (category_name) VALUES
('Crop Suggestion'),
('Fertilizer'),
('Pest Control'),
('Soil Health'),
('Irrigation'),
('Harvest Time'),
('Weather Advice'),
('Crop Disease'),
('Storage Methods'),
('Market Price'),
('Government Schemes'),
('Farm Management'),
('Seed Selection'),
('Organic Farming');

-- 50+ Training Q&As
INSERT INTO chatbot_training (question, answer, category) VALUES

-- Crop Suggestion (10)
('Which crop grows best in winter?', 'Wheat and mustard grow best in the winter (Rabi) season. Other good winter crops include barley, peas, chickpea, and lentils.', 'Crop Suggestion'),
('Which crop is best in summer?', 'Maize, cotton, groundnut, and moong dal are good crops for the summer (Zaid) season. They tolerate heat well.', 'Crop Suggestion'),
('Which crop is best for kharif season?', 'Rice, maize, cotton, soybean, groundnut, and sugarcane are the best Kharif crops. They are sown in June-July with the monsoon.', 'Crop Suggestion'),
('What crop should I grow in black soil?', 'Black soil (Regur) is best for cotton, soybean, wheat, jowar, and sunflower. It retains moisture well and is very fertile.', 'Crop Suggestion'),
('Which crop is best for sandy soil?', 'Sandy soil is suitable for groundnut, watermelon, carrot, radish, and sweet potato. These crops do not need heavy water retention.', 'Crop Suggestion'),
('What is the best crop for small farmers?', 'Vegetables like tomato, onion, and chilli are best for small farmers as they give high returns in small land areas. Marigold flowers are also profitable.', 'Crop Suggestion'),
('Which crop gives highest profit in India?', 'Saffron, vanilla, and sandalwood give the highest profit but require special conditions. For common farmers, tomato, potato, and onion give good returns.', 'Crop Suggestion'),
('What crops grow well in Haryana?', 'Haryana is best known for wheat, rice, sugarcane, and mustard. The state has fertile alluvial soil and good irrigation facilities.', 'Crop Suggestion'),
('Which crop is best for Maharashtra?', 'Maharashtra is suitable for sugarcane, cotton, soybean, onion, grapes, and oranges. The Vidarbha region is famous for cotton.', 'Crop Suggestion'),
('What is intercropping?', 'Intercropping means growing two or more crops together in the same field at the same time. For example, growing maize and beans together. It improves soil health and increases income.', 'Crop Suggestion'),

-- Fertilizer (8)
('Best fertilizer for rice?', 'Use NPK fertilizer (Nitrogen, Phosphorus, Potassium) and organic compost for rice. Apply urea in split doses — at transplanting, tillering, and panicle initiation stages.', 'Fertilizer'),
('Best fertilizer for potato?', 'Use NPK fertilizer and compost for potato cultivation. Apply DAP at planting time and urea as top dressing after 30 days.', 'Fertilizer'),
('How to use urea fertilizer?', 'Urea should be applied in 2-3 split doses. Do not apply all at once. Apply when soil is moist. Avoid applying before heavy rain as it causes nitrogen loss.', 'Fertilizer'),
('What is DAP fertilizer?', 'DAP (Di-Ammonium Phosphate) is a phosphorus-rich fertilizer. It is applied at the time of sowing to promote root development and early plant growth.', 'Fertilizer'),
('What is organic fertilizer?', 'Organic fertilizers include cow dung manure, vermicompost, green manure, and compost. They improve soil structure, water retention, and provide slow-release nutrients.', 'Fertilizer'),
('How to make vermicompost?', 'Vermicompost is made by feeding organic waste to earthworms. Collect kitchen waste, crop residue, and cow dung. Add earthworms and keep moist. Ready in 45-60 days.', 'Fertilizer'),
('What fertilizer is best for wheat?', 'For wheat, apply DAP at sowing time and urea in two splits — at first irrigation and at tillering stage. Also use zinc sulfate if soil is zinc deficient.', 'Fertilizer'),
('How much fertilizer should I use per acre?', 'For most crops, use 50 kg DAP and 50 kg urea per acre as a general guideline. Always do a soil test first to determine exact nutrient requirements.', 'Fertilizer'),

-- Pest Control (7)
('How to control pests in tomato?', 'Use neem oil spray (5 ml per liter of water) to control tomato pests like aphids and whiteflies. For fruit borer, use Bacillus thuringiensis (Bt) spray.', 'Pest Control'),
('How to control aphids in crops?', 'Spray neem oil or insecticidal soap solution to control aphids. You can also introduce ladybugs as natural predators. Avoid excess nitrogen fertilizer which attracts aphids.', 'Pest Control'),
('How to protect crops from locusts?', 'For locust control, spray malathion or chlorpyrifos pesticide. Create noise barriers and use fire to drive them away. Report locust sightings to local agriculture department immediately.', 'Pest Control'),
('What is integrated pest management?', 'Integrated Pest Management (IPM) combines biological, cultural, and chemical methods to control pests with minimum environmental impact. It includes crop rotation, natural predators, and targeted pesticide use.', 'Pest Control'),
('How to control stem borer in rice?', 'For stem borer in rice, use Cartap hydrochloride or Chlorantraniliprole granules. Remove and destroy egg masses. Maintain proper water level in paddy fields.', 'Pest Control'),
('How to control weeds in farm?', 'Use herbicides like Atrazine for maize or Pendimethalin for wheat. Manual weeding is best for small farms. Mulching also prevents weed growth effectively.', 'Pest Control'),
('What is neem oil spray?', 'Neem oil spray is a natural organic pesticide made from neem seeds. Mix 5 ml neem oil with 1 liter water and a few drops of soap. Spray on leaves to repel insects.', 'Pest Control'),

-- Soil Health (5)
('How to improve soil fertility?', 'Add organic matter like compost, green manure, and crop residue. Practice crop rotation. Do soil testing every 2-3 years. Avoid over-use of chemical fertilizers.', 'Soil Health'),
('What is soil pH and why is it important?', 'Soil pH measures acidity or alkalinity on a scale of 0-14. Most crops grow best at pH 6-7. Low pH (acidic) can be corrected with lime. High pH (alkaline) can be corrected with gypsum or sulfur.', 'Soil Health'),
('How to do soil testing?', 'Collect soil samples from 10-15 spots in your field at 15 cm depth. Mix them together and send 500 grams to the nearest Soil Testing Laboratory (STL). Results show NPK levels and pH.', 'Soil Health'),
('What is green manure?', 'Green manure involves growing crops like dhaincha, sunhemp, or cowpea and plowing them into the soil before flowering. This adds nitrogen and organic matter to the soil.', 'Soil Health'),
('How to prevent soil erosion?', 'Plant cover crops, use contour farming on slopes, build bunds and terraces, practice mulching, and avoid leaving soil bare. Trees and grass on field borders also help.', 'Soil Health'),

-- Irrigation (5)
('What is drip irrigation?', 'Drip irrigation delivers water directly to plant roots through small tubes and emitters. It saves 40-60% water compared to flood irrigation and reduces weed growth. Best for vegetables and orchards.', 'Irrigation'),
('How often should I water wheat?', 'Wheat needs 4-6 irrigations during its growth. Critical stages are crown root initiation (21 days), tillering (45 days), jointing (65 days), flowering (85 days), and grain filling (105 days).', 'Irrigation'),
('What is sprinkler irrigation?', 'Sprinkler irrigation sprays water over crops like rain. It is suitable for uneven terrain and crops like wheat, vegetables, and groundnut. It saves 25-40% water compared to flood irrigation.', 'Irrigation'),
('How to conserve water in farming?', 'Use drip or sprinkler irrigation, mulch the soil, irrigate in early morning or evening, practice rainwater harvesting, and grow drought-resistant crop varieties.', 'Irrigation'),
('When should I irrigate rice paddy?', 'Rice needs standing water of 5-7 cm during most of its growth. Drain the field 10-15 days before harvest. Alternate wetting and drying (AWD) technique can save 30% water.', 'Irrigation'),

-- Harvest Time (4)
('When to harvest wheat?', 'Harvest wheat when the crop turns golden yellow and grains are hard. This is usually 110-120 days after sowing. Moisture content should be around 12-14% at harvest.', 'Harvest Time'),
('When to harvest rice?', 'Rice is ready to harvest 25-35 days after flowering when 80-85% of grains turn golden yellow. Harvesting too early causes immature grains; too late causes shattering losses.', 'Harvest Time'),
('How to know if tomatoes are ready to harvest?', 'Tomatoes are ready when they turn fully red (or the variety color) and are slightly soft to touch. Harvest in the morning when it is cool. Do not wait until fully soft.', 'Harvest Time'),
('When to harvest onion?', 'Onions are ready when 50-75% of the tops fall over naturally. Stop irrigation 10-15 days before harvest. Cure onions in shade for 7-10 days before storage.', 'Harvest Time'),

-- Weather Advice (4)
('How does weather affect crops?', 'Temperature, rainfall, humidity, and sunlight directly affect crop growth. Frost damages tender crops, excess rain causes waterlogging, drought reduces yield. Monitor weather forecasts regularly.', 'Weather Advice'),
('What to do before heavy rain?', 'Before heavy rain, ensure proper drainage channels are open, stake tall crops to prevent lodging, avoid applying fertilizers or pesticides, and harvest mature crops if possible.', 'Weather Advice'),
('How to protect crops from frost?', 'Cover plants with cloth or plastic sheets at night, irrigate fields before frost (water releases heat), use smoke screens, and grow frost-resistant varieties in frost-prone areas.', 'Weather Advice'),
('What crops are drought resistant?', 'Drought-resistant crops include sorghum (jowar), pearl millet (bajra), chickpea, cowpea, and castor. These crops can survive with less water and are suitable for dry regions.', 'Weather Advice'),

-- Crop Disease (4)
('What is wheat rust disease?', 'Wheat rust is a fungal disease causing orange, yellow, or black pustules on leaves and stems. Use rust-resistant varieties and spray Propiconazole fungicide at first sign of infection.', 'Crop Disease'),
('How to treat rice blast disease?', 'Rice blast is a serious fungal disease. Use blast-resistant varieties, avoid excess nitrogen, maintain proper water level, and spray Tricyclazole or Isoprothiolane fungicide.', 'Crop Disease'),
('What causes yellow leaves in crops?', 'Yellow leaves can be caused by nitrogen deficiency, iron deficiency, waterlogging, root rot, or viral diseases. Do a soil test and check for pests. Apply appropriate fertilizer or fungicide.', 'Crop Disease'),
('How to control powdery mildew?', 'Powdery mildew is a white powdery fungal coating on leaves. Spray sulfur-based fungicide or neem oil. Ensure good air circulation between plants and avoid overhead irrigation.', 'Crop Disease'),

-- Storage Methods (3)
('How to store wheat grain?', 'Store wheat in clean, dry, airtight containers or bags. Moisture content should be below 12%. Use aluminum phosphide tablets for pest control. Store in cool, dark place.', 'Storage Methods'),
('How to store onions after harvest?', 'Cure onions for 7-10 days in shade with good ventilation. Store in mesh bags or slatted crates in a cool, dry, well-ventilated place. Do not store in plastic bags.', 'Storage Methods'),
('What is cold storage for vegetables?', 'Cold storage maintains low temperature (0-10°C) and humidity to extend shelf life of vegetables and fruits. Potato, apple, and grapes are commonly stored in cold storage.', 'Storage Methods'),

-- Government Schemes (3)
('What is PM Kisan scheme?', 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi) provides Rs. 6000 per year to eligible farmers in three installments of Rs. 2000 each. Register at pmkisan.gov.in or nearest CSC center.', 'Government Schemes'),
('What is Pradhan Mantri Fasal Bima Yojana?', 'PMFBY is a crop insurance scheme that protects farmers against crop losses due to natural calamities, pests, and diseases. Premium is 2% for Kharif, 1.5% for Rabi crops. Apply through banks or CSC.', 'Government Schemes'),
('What is Soil Health Card scheme?', 'The Soil Health Card scheme provides farmers with a card showing soil nutrient status and fertilizer recommendations. Get your soil tested at the nearest Krishi Vigyan Kendra (KVK) or agriculture office.', 'Government Schemes'),

-- Market Price (2)
('How to get best price for crops?', 'Sell at APMC mandis for transparent pricing, use e-NAM (National Agriculture Market) online platform, join Farmer Producer Organizations (FPOs), and check MSP (Minimum Support Price) rates.', 'Market Price'),
('What is MSP in agriculture?', 'MSP (Minimum Support Price) is the price set by the government to protect farmers from market price fluctuations. The government buys crops at MSP through procurement agencies like FCI and NAFED.', 'Market Price'),

-- Farm Management (2)
('How to manage a small farm efficiently?', 'Plan crop rotation, maintain records of expenses and income, use quality seeds, do soil testing, adopt drip irrigation, join a farmer group or FPO, and use government schemes for subsidies.', 'Farm Management'),
('What is crop rotation and its benefits?', 'Crop rotation means growing different crops in the same field in successive seasons. It improves soil fertility, breaks pest and disease cycles, reduces weed pressure, and increases overall yield.', 'Farm Management');
