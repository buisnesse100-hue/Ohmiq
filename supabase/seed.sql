-- =========================================================
-- OHMIQ — Seed de developpement : taxonomie electronique complete
-- Remplace la taxonomie generaliste de la V1 CONTACTA.
-- Uniquement des donnees FICTIVES en dehors des categories elles-memes.
-- =========================================================

-- Repart d'une base propre pour la taxonomie (idempotent en developpement).
delete from listing_attribute_values;
delete from category_attributes;
delete from models;
delete from brand_categories;
delete from brands;
delete from listings;
delete from subcategories;
delete from categories;

-- ---------- Categories ----------
insert into categories (slug, name, icon, display_order) values
  ('telephones-accessoires', 'Telephones & accessoires', 'Smartphone', 1),
  ('informatique', 'Informatique', 'Laptop', 2),
  ('composants-pc', 'Composants PC', 'Cpu', 3),
  ('gaming', 'Gaming', 'Gamepad2', 4),
  ('tv-video', 'TV & video', 'Tv', 5),
  ('audio', 'Audio', 'Headphones', 6),
  ('photo-video', 'Photo & video', 'Camera', 7),
  ('maison-electromenager', 'Maison & electromenager', 'Home', 8),
  ('objets-connectes', 'Objets connectes', 'Watch', 9),
  ('energie-electrique', 'Energie & electrique', 'BatteryCharging', 10),
  ('mobilite-electrique', 'Mobilite electrique', 'Bike', 11),
  ('bureau-impression', 'Bureau & impression', 'Printer', 12),
  ('entretien-jardin-electrique', 'Entretien & jardin electrique', 'Trees', 13),
  ('outils-electriques', 'Outils electriques', 'Wrench', 14),
  ('automobile-electronique', 'Automobile electronique', 'Car', 15),
  ('bien-etre-appareils-personnels', 'Bien-etre & appareils personnels', 'HeartPulse', 16),
  ('professionnel', 'Professionnel', 'Briefcase', 17),
  ('autres-electroniques', 'Autres electroniques', 'Package', 18)
on conflict (slug) do nothing;

-- ---------- Sous-categories ----------
insert into subcategories (category_id, slug, name, display_order)
select c.id, s.slug, s.name, s.ord
from categories c
join (values
  ('telephones-accessoires', 'iphone', 'iPhone', 1),
  ('telephones-accessoires', 'samsung', 'Samsung', 2),
  ('telephones-accessoires', 'xiaomi', 'Xiaomi', 3),
  ('telephones-accessoires', 'google-pixel', 'Google Pixel', 4),
  ('telephones-accessoires', 'oneplus', 'OnePlus', 5),
  ('telephones-accessoires', 'huawei', 'Huawei', 6),
  ('telephones-accessoires', 'autres-smartphones', 'Autres smartphones', 7),
  ('telephones-accessoires', 'telephones-classiques', 'Telephones classiques', 8),
  ('telephones-accessoires', 'coques', 'Coques', 9),
  ('telephones-accessoires', 'chargeurs', 'Chargeurs', 10),
  ('telephones-accessoires', 'cables', 'Cables', 11),
  ('telephones-accessoires', 'batteries-externes', 'Batteries externes', 12),
  ('telephones-accessoires', 'accessoires-telephone', 'Accessoires telephone', 13),
  ('informatique', 'pc-portables', 'PC portables', 1),
  ('informatique', 'pc-fixes', 'PC fixes', 2),
  ('informatique', 'macbook', 'MacBook', 3),
  ('informatique', 'imac', 'iMac', 4),
  ('informatique', 'mac-mini', 'Mac mini', 5),
  ('informatique', 'mac-studio', 'Mac Studio', 6),
  ('informatique', 'chromebook', 'Chromebook', 7),
  ('informatique', 'serveurs', 'Serveurs', 8),
  ('informatique', 'mini-pc', 'Mini-PC', 9),
  ('informatique', 'stations-de-travail', 'Stations de travail', 10),
  ('composants-pc', 'cartes-graphiques', 'Cartes graphiques', 1),
  ('composants-pc', 'processeurs', 'Processeurs', 2),
  ('composants-pc', 'cartes-meres', 'Cartes meres', 3),
  ('composants-pc', 'ram', 'RAM', 4),
  ('composants-pc', 'ssd', 'SSD', 5),
  ('composants-pc', 'hdd', 'HDD', 6),
  ('composants-pc', 'alimentations', 'Alimentations', 7),
  ('composants-pc', 'boitiers', 'Boitiers', 8),
  ('composants-pc', 'ventilateurs', 'Ventilateurs', 9),
  ('composants-pc', 'watercooling', 'Watercooling', 10),
  ('composants-pc', 'cartes-reseau', 'Cartes reseau', 11),
  ('composants-pc', 'cartes-son', 'Cartes son', 12),
  ('composants-pc', 'cables-pc', 'Cables PC', 13),
  ('composants-pc', 'accessoires-pc', 'Accessoires PC', 14),
  ('gaming', 'playstation', 'PlayStation', 1),
  ('gaming', 'xbox', 'Xbox', 2),
  ('gaming', 'nintendo-switch', 'Nintendo Switch', 3),
  ('gaming', 'anciennes-consoles', 'Anciennes consoles', 4),
  ('gaming', 'consoles-portables', 'Consoles portables', 5),
  ('gaming', 'manettes', 'Manettes', 6),
  ('gaming', 'casques-gaming', 'Casques gaming', 7),
  ('gaming', 'claviers-gaming', 'Claviers gaming', 8),
  ('gaming', 'souris-gaming', 'Souris gaming', 9),
  ('gaming', 'volants', 'Volants', 10),
  ('gaming', 'accessoires-gaming', 'Accessoires gaming', 11),
  ('gaming', 'jeux-video', 'Jeux video', 12),
  ('tv-video', 'televiseurs', 'Televiseurs', 1),
  ('tv-video', 'smart-tv', 'Smart TV', 2),
  ('tv-video', 'videoprojecteurs', 'Videoprojecteurs', 3),
  ('tv-video', 'lecteurs-blu-ray-dvd', 'Lecteurs Blu-ray/DVD', 4),
  ('tv-video', 'box-tv', 'Box TV', 5),
  ('tv-video', 'accessoires-tv', 'Accessoires TV', 6),
  ('tv-video', 'barres-de-son', 'Barres de son', 7),
  ('audio', 'ecouteurs', 'Ecouteurs', 1),
  ('audio', 'airpods', 'AirPods', 2),
  ('audio', 'casques', 'Casques', 3),
  ('audio', 'enceintes-bluetooth', 'Enceintes Bluetooth', 4),
  ('audio', 'enceintes-hi-fi', 'Enceintes hi-fi', 5),
  ('audio', 'amplificateurs', 'Amplificateurs', 6),
  ('audio', 'platines-vinyles', 'Platines vinyles', 7),
  ('audio', 'microphones', 'Microphones', 8),
  ('audio', 'materiel-dj', 'Materiel DJ', 9),
  ('audio', 'home-cinema', 'Home cinema', 10),
  ('photo-video', 'appareils-photo', 'Appareils photo', 1),
  ('photo-video', 'reflex', 'Reflex', 2),
  ('photo-video', 'hybrides', 'Hybrides', 3),
  ('photo-video', 'cameras', 'Cameras', 4),
  ('photo-video', 'objectifs', 'Objectifs', 5),
  ('photo-video', 'trepieds', 'Trepieds', 6),
  ('photo-video', 'drones', 'Drones', 7),
  ('photo-video', 'stabilisateurs', 'Stabilisateurs', 8),
  ('photo-video', 'micros', 'Micros', 9),
  ('photo-video', 'accessoires-photo-video', 'Accessoires photo/video', 10),
  ('maison-electromenager', 'aspirateurs', 'Aspirateurs', 1),
  ('maison-electromenager', 'aspirateurs-robots', 'Aspirateurs robots', 2),
  ('maison-electromenager', 'lave-linge', 'Lave-linge', 3),
  ('maison-electromenager', 'seche-linge', 'Seche-linge', 4),
  ('maison-electromenager', 'lave-vaisselle', 'Lave-vaisselle', 5),
  ('maison-electromenager', 'refrigerateurs', 'Refrigerateurs', 6),
  ('maison-electromenager', 'congelateurs', 'Congelateurs', 7),
  ('maison-electromenager', 'fours', 'Fours', 8),
  ('maison-electromenager', 'micro-ondes', 'Micro-ondes', 9),
  ('maison-electromenager', 'plaques-de-cuisson', 'Plaques de cuisson', 10),
  ('maison-electromenager', 'hottes', 'Hottes', 11),
  ('maison-electromenager', 'machines-a-cafe', 'Machines a cafe', 12),
  ('maison-electromenager', 'robots-de-cuisine', 'Robots de cuisine', 13),
  ('maison-electromenager', 'mixeurs', 'Mixeurs', 14),
  ('maison-electromenager', 'bouilloires', 'Bouilloires', 15),
  ('maison-electromenager', 'grille-pain', 'Grille-pain', 16),
  ('maison-electromenager', 'appareils-de-cuisson', 'Appareils de cuisson', 17),
  ('maison-electromenager', 'climatiseurs', 'Climatiseurs', 18),
  ('maison-electromenager', 'chauffages-electriques', 'Chauffages electriques', 19),
  ('maison-electromenager', 'ventilateurs', 'Ventilateurs', 20),
  ('maison-electromenager', 'purificateurs-d-air', 'Purificateurs d''air', 21),
  ('maison-electromenager', 'deshumidificateurs', 'Deshumidificateurs', 22),
  ('maison-electromenager', 'appareils-de-nettoyage', 'Appareils de nettoyage', 23),
  ('objets-connectes', 'apple-watch', 'Apple Watch', 1),
  ('objets-connectes', 'samsung-galaxy-watch', 'Samsung Galaxy Watch', 2),
  ('objets-connectes', 'montres-connectees', 'Montres connectees', 3),
  ('objets-connectes', 'bracelets-connectes', 'Bracelets connectes', 4),
  ('objets-connectes', 'trackers', 'Trackers', 5),
  ('objets-connectes', 'objets-domotiques', 'Objets domotiques', 6),
  ('objets-connectes', 'assistants-vocaux', 'Assistants vocaux', 7),
  ('objets-connectes', 'prises-connectees', 'Prises connectees', 8),
  ('objets-connectes', 'ampoules-connectees', 'Ampoules connectees', 9),
  ('objets-connectes', 'cameras-de-surveillance', 'Cameras de surveillance', 10),
  ('energie-electrique', 'batteries', 'Batteries', 1),
  ('energie-electrique', 'chargeurs', 'Chargeurs', 2),
  ('energie-electrique', 'stations-electriques-portables', 'Stations electriques portables', 3),
  ('energie-electrique', 'onduleurs', 'Onduleurs', 4),
  ('energie-electrique', 'panneaux-solaires', 'Panneaux solaires', 5),
  ('energie-electrique', 'chargeurs-solaires', 'Chargeurs solaires', 6),
  ('energie-electrique', 'groupes-electrogenes', 'Groupes electrogenes', 7),
  ('energie-electrique', 'cables-electriques', 'Cables electriques', 8),
  ('energie-electrique', 'multiprises', 'Multiprises', 9),
  ('energie-electrique', 'alimentations-electriques', 'Alimentations electriques', 10),
  ('energie-electrique', 'equipements-electriques', 'Equipements electriques', 11),
  ('mobilite-electrique', 'velos-electriques', 'Velos electriques', 1),
  ('mobilite-electrique', 'trottinettes-electriques', 'Trottinettes electriques', 2),
  ('mobilite-electrique', 'hoverboards', 'Hoverboards', 3),
  ('mobilite-electrique', 'gyropodes', 'Gyropodes', 4),
  ('mobilite-electrique', 'batteries-mobilite', 'Batteries mobilite', 5),
  ('mobilite-electrique', 'chargeurs-mobilite', 'Chargeurs mobilite', 6),
  ('mobilite-electrique', 'accessoires-mobilite', 'Accessoires mobilite', 7),
  ('bureau-impression', 'imprimantes', 'Imprimantes', 1),
  ('bureau-impression', 'scanners', 'Scanners', 2),
  ('bureau-impression', 'photocopieurs', 'Photocopieurs', 3),
  ('bureau-impression', 'cartouches', 'Cartouches', 4),
  ('bureau-impression', 'etiqueteuses', 'Etiqueteuses', 5),
  ('bureau-impression', 'destructeurs-de-documents', 'Destructeurs de documents', 6),
  ('bureau-impression', 'videoprojecteurs-bureau', 'Videoprojecteurs bureau', 7),
  ('bureau-impression', 'ecrans', 'Ecrans', 8),
  ('bureau-impression', 'webcams', 'Webcams', 9),
  ('bureau-impression', 'accessoires-de-bureau', 'Accessoires de bureau', 10),
  ('entretien-jardin-electrique', 'aspirateurs-jardin', 'Aspirateurs jardin', 1),
  ('entretien-jardin-electrique', 'nettoyeurs-haute-pression', 'Nettoyeurs haute pression', 2),
  ('entretien-jardin-electrique', 'tondeuses-electriques', 'Tondeuses electriques', 3),
  ('entretien-jardin-electrique', 'taille-haies', 'Taille-haies', 4),
  ('entretien-jardin-electrique', 'souffleurs', 'Souffleurs', 5),
  ('entretien-jardin-electrique', 'debroussailleuses', 'Debroussailleuses', 6),
  ('entretien-jardin-electrique', 'outils-electriques-jardin', 'Outils electriques jardin', 7),
  ('entretien-jardin-electrique', 'perceuses-jardin', 'Perceuses jardin', 8),
  ('entretien-jardin-electrique', 'visseuses-jardin', 'Visseuses jardin', 9),
  ('entretien-jardin-electrique', 'ponceuses-jardin', 'Ponceuses jardin', 10),
  ('entretien-jardin-electrique', 'scies-jardin', 'Scies jardin', 11),
  ('entretien-jardin-electrique', 'compresseurs', 'Compresseurs', 12),
  ('entretien-jardin-electrique', 'chargeurs-de-batterie-jardin', 'Chargeurs de batterie jardin', 13),
  ('outils-electriques', 'perceuses', 'Perceuses', 1),
  ('outils-electriques', 'visseuses', 'Visseuses', 2),
  ('outils-electriques', 'meuleuses', 'Meuleuses', 3),
  ('outils-electriques', 'scies', 'Scies', 4),
  ('outils-electriques', 'ponceuses', 'Ponceuses', 5),
  ('outils-electriques', 'rabots', 'Rabots', 6),
  ('outils-electriques', 'defonceuses', 'Defonceuses', 7),
  ('outils-electriques', 'outils-multifonctions', 'Outils multifonctions', 8),
  ('outils-electriques', 'batteries-outils', 'Batteries outils', 9),
  ('outils-electriques', 'chargeurs-outils', 'Chargeurs outils', 10),
  ('outils-electriques', 'coffrets-d-outils', 'Coffrets d''outils', 11),
  ('automobile-electronique', 'autoradios', 'Autoradios', 1),
  ('automobile-electronique', 'gps', 'GPS', 2),
  ('automobile-electronique', 'dashcams', 'Dashcams', 3),
  ('automobile-electronique', 'chargeurs-voiture', 'Chargeurs voiture', 4),
  ('automobile-electronique', 'batteries-auto', 'Batteries auto', 5),
  ('automobile-electronique', 'cables-auto', 'Cables auto', 6),
  ('automobile-electronique', 'systemes-audio-auto', 'Systemes audio auto', 7),
  ('automobile-electronique', 'ecrans-auto', 'Ecrans auto', 8),
  ('automobile-electronique', 'accessoires-electroniques-auto', 'Accessoires electroniques auto', 9),
  ('bien-etre-appareils-personnels', 'seche-cheveux', 'Seche-cheveux', 1),
  ('bien-etre-appareils-personnels', 'tondeuses-personnelles', 'Tondeuses personnelles', 2),
  ('bien-etre-appareils-personnels', 'rasoirs-electriques', 'Rasoirs electriques', 3),
  ('bien-etre-appareils-personnels', 'appareils-de-coiffure', 'Appareils de coiffure', 4),
  ('bien-etre-appareils-personnels', 'balances-connectees', 'Balances connectees', 5),
  ('bien-etre-appareils-personnels', 'appareils-de-massage', 'Appareils de massage', 6),
  ('bien-etre-appareils-personnels', 'appareils-de-soin-electrique', 'Appareils de soin electrique', 7),
  ('professionnel', 'materiel-informatique-professionnel', 'Materiel informatique professionnel', 1),
  ('professionnel', 'equipements-reseau', 'Equipements reseau', 2),
  ('professionnel', 'serveurs-professionnels', 'Serveurs professionnels', 3),
  ('professionnel', 'imprimantes-professionnelles', 'Imprimantes professionnelles', 4),
  ('professionnel', 'materiel-audiovisuel', 'Materiel audiovisuel', 5),
  ('professionnel', 'equipements-electroniques-industriels', 'Equipements electroniques industriels', 6),
  ('professionnel', 'outils-professionnels', 'Outils professionnels', 7)
) as s(cat_slug, slug, name, ord) on c.slug = s.cat_slug
on conflict (category_id, slug) do nothing;

-- ---------- Marques (transverses ou specialisees) ----------
insert into brands (slug, name) values
  ('apple', 'Apple'),
  ('samsung', 'Samsung'),
  ('xiaomi', 'Xiaomi'),
  ('google', 'Google'),
  ('oneplus', 'OnePlus'),
  ('huawei', 'Huawei'),
  ('sony', 'Sony'),
  ('microsoft', 'Microsoft'),
  ('nintendo', 'Nintendo'),
  ('nvidia', 'Nvidia'),
  ('amd', 'AMD'),
  ('intel', 'Intel'),
  ('asus', 'Asus'),
  ('msi', 'MSI'),
  ('gigabyte', 'Gigabyte'),
  ('lenovo', 'Lenovo'),
  ('hp', 'HP'),
  ('dell', 'Dell'),
  ('lg', 'LG'),
  ('bosch', 'Bosch'),
  ('dyson', 'Dyson'),
  ('philips', 'Philips'),
  ('bose', 'Bose'),
  ('jbl', 'JBL'),
  ('canon', 'Canon'),
  ('nikon', 'Nikon'),
  ('dji', 'DJI'),
  ('makita', 'Makita'),
  ('bosch-outillage', 'Bosch Outillage'),
  ('ecoflow', 'EcoFlow'),
  ('anker', 'Anker'),
  ('xtreme', 'Autre marque')
on conflict (slug) do nothing;

-- ---------- Attributs dynamiques d'exemple (extensibles depuis l'admin) ----------
-- Smartphones
insert into category_attributes (category_id, subcategory_id, key, label, input_type, unit, options, is_required, display_order)
select c.id, sc.id, a.key, a.label, a.input_type::attribute_input_type, a.unit, a.options::jsonb, a.is_required, a.ord
from categories c
join subcategories sc on sc.category_id = c.id
join (values
  ('telephones-accessoires', 'iphone', 'storage_gb', 'Stockage', 'select', 'Go', '["64", "128", "256", "512", "1000"]', true, 1),
  ('telephones-accessoires', 'iphone', 'battery_health_percent', 'Etat de la batterie', 'number', '%', null, false, 2),
  ('telephones-accessoires', 'iphone', 'screen_condition', 'Etat de l''ecran', 'select', null, '["Parfait", "Micro-rayures", "Rayures visibles", "Fissure"]', true, 3),
  ('telephones-accessoires', 'samsung', 'storage_gb', 'Stockage', 'select', 'Go', '["64", "128", "256", "512", "1000"]', true, 1),
  ('telephones-accessoires', 'samsung', 'battery_health_percent', 'Etat de la batterie', 'number', '%', null, false, 2)
) as a(cat_slug, sub_slug, key, label, input_type, unit, options, is_required, ord)
  on c.slug = a.cat_slug and sc.slug = a.sub_slug
on conflict (category_id, subcategory_id, key) do nothing;

-- Composants PC : cartes graphiques
insert into category_attributes (category_id, subcategory_id, key, label, input_type, unit, options, is_required, display_order)
select c.id, sc.id, a.key, a.label, a.input_type::attribute_input_type, a.unit, a.options::jsonb, a.is_required, a.ord
from categories c
join subcategories sc on sc.category_id = c.id
join (values
  ('composants-pc', 'cartes-graphiques', 'vram_gb', 'Memoire video (VRAM)', 'select', 'Go', '["4", "6", "8", "10", "12", "16", "20", "24"]', true, 1),
  ('composants-pc', 'cartes-graphiques', 'connectivity', 'Connectique', 'text', null, null, false, 2),
  ('composants-pc', 'cartes-graphiques', 'power_consumption_w', 'Consommation', 'number', 'W', null, false, 3)
) as a(cat_slug, sub_slug, key, label, input_type, unit, options, is_required, ord)
  on c.slug = a.cat_slug and sc.slug = a.sub_slug
on conflict (category_id, subcategory_id, key) do nothing;

-- Maison : aspirateurs
insert into category_attributes (category_id, subcategory_id, key, label, input_type, unit, options, is_required, display_order)
select c.id, sc.id, a.key, a.label, a.input_type::attribute_input_type, a.unit, a.options::jsonb, a.is_required, a.ord
from categories c
join subcategories sc on sc.category_id = c.id
join (values
  ('maison-electromenager', 'aspirateurs', 'power_watts', 'Puissance', 'number', 'W', null, false, 1),
  ('maison-electromenager', 'aspirateurs', 'battery_autonomy_min', 'Autonomie batterie', 'number', 'min', null, false, 2),
  ('maison-electromenager', 'aspirateurs-robots', 'battery_autonomy_min', 'Autonomie batterie', 'number', 'min', null, false, 1)
) as a(cat_slug, sub_slug, key, label, input_type, unit, options, is_required, ord)
  on c.slug = a.cat_slug and sc.slug = a.sub_slug
on conflict (category_id, subcategory_id, key) do nothing;

-- Note : ce fichier montre le principe. En production, la gestion des marques, modeles
-- et attributs par categorie se fait depuis /admin (a construire dans une prochaine
-- iteration) plutot que par SQL manuel.
