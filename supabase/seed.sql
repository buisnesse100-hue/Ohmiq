-- OHMIQ — Seed (idempotent, sans suppression). Taxonomie électronique + marques + attributs d'exemple.
insert into categories (slug, name, icon, display_order) values
  ('telephones-accessoires', 'Téléphones & accessoires', 'Smartphone', 1),
  ('informatique', 'Informatique', 'Laptop', 2),
  ('composants-pc', 'Composants PC', 'Cpu', 3),
  ('gaming', 'Gaming', 'Gamepad2', 4),
  ('tv-video', 'TV & vidéo', 'Tv', 5),
  ('audio', 'Audio', 'Headphones', 6),
  ('photo-video', 'Photo & vidéo', 'Camera', 7),
  ('maison-electromenager', 'Maison & électroménager', 'Home', 8),
  ('objets-connectes', 'Objets connectés', 'Watch', 9),
  ('energie-electrique', 'Énergie & électrique', 'BatteryCharging', 10),
  ('mobilite-electrique', 'Mobilité électrique', 'Bike', 11),
  ('bureau-impression', 'Bureau & impression', 'Printer', 12),
  ('entretien-jardin-electrique', 'Entretien & jardin électrique', 'Trees', 13),
  ('outils-electriques', 'Outils électriques', 'Wrench', 14),
  ('automobile-electronique', 'Automobile électronique', 'Car', 15),
  ('bien-etre-appareils-personnels', 'Bien-être & appareils personnels', 'HeartPulse', 16),
  ('professionnel', 'Professionnel', 'Briefcase', 17),
  ('autres-electroniques', 'Autres électroniques', 'Package', 18)
on conflict (slug) do nothing;

insert into subcategories (category_id, slug, name, display_order)
select c.id,
       regexp_replace(translate(lower(u.n), 'éèêëàâôîïçûù', 'eeeeaaoiicuu'), '[^a-z0-9]+', '-', 'g'),
       u.n, u.ord
from (values
  ('telephones-accessoires', array['iPhone','Samsung','Xiaomi','Google Pixel','OnePlus','Huawei','Autres smartphones','Téléphones classiques','Coques','Chargeurs','Câbles','Batteries externes','Accessoires téléphone']),
  ('informatique', array['PC portables','PC fixes','MacBook','iMac','Mac mini','Mac Studio','Chromebook','Serveurs','Mini-PC','Stations de travail']),
  ('composants-pc', array['Cartes graphiques','Processeurs','Cartes mères','RAM','SSD','HDD','Alimentations','Boîtiers','Ventilateurs','Watercooling','Cartes réseau','Cartes son','Câbles PC','Accessoires PC']),
  ('gaming', array['PlayStation','Xbox','Nintendo Switch','Anciennes consoles','Consoles portables','Manettes','Casques gaming','Claviers gaming','Souris gaming','Volants','Accessoires gaming','Jeux vidéo']),
  ('tv-video', array['Téléviseurs','Smart TV','Vidéoprojecteurs','Lecteurs Blu-ray/DVD','Box TV','Accessoires TV','Barres de son']),
  ('audio', array['Écouteurs','AirPods','Casques','Enceintes Bluetooth','Enceintes hi-fi','Amplificateurs','Platines vinyles','Microphones','Matériel DJ','Home cinéma']),
  ('photo-video', array['Appareils photo','Reflex','Hybrides','Caméras','Objectifs','Trépieds','Drones','Stabilisateurs','Micros','Accessoires photo/vidéo']),
  ('maison-electromenager', array['Aspirateurs','Aspirateurs robots','Lave-linge','Sèche-linge','Lave-vaisselle','Réfrigérateurs','Congélateurs','Fours','Micro-ondes','Plaques de cuisson','Hottes','Machines à café','Robots de cuisine','Mixeurs','Bouilloires','Grille-pain','Appareils de cuisson','Climatiseurs','Chauffages électriques','Ventilateurs','Purificateurs d''air','Déshumidificateurs','Appareils de nettoyage']),
  ('objets-connectes', array['Apple Watch','Samsung Galaxy Watch','Montres connectées','Bracelets connectés','Trackers','Objets domotiques','Assistants vocaux','Prises connectées','Ampoules connectées','Caméras de surveillance']),
  ('energie-electrique', array['Batteries','Chargeurs','Stations électriques portables','Onduleurs','Panneaux solaires','Chargeurs solaires','Groupes électrogènes','Câbles électriques','Multiprises','Alimentations électriques','Équipements électriques']),
  ('mobilite-electrique', array['Vélos électriques','Trottinettes électriques','Hoverboards','Gyropodes','Batteries mobilité','Chargeurs mobilité','Accessoires mobilité']),
  ('bureau-impression', array['Imprimantes','Scanners','Photocopieurs','Cartouches','Étiqueteuses','Destructeurs de documents','Vidéoprojecteurs bureau','Écrans','Webcams','Accessoires de bureau']),
  ('entretien-jardin-electrique', array['Aspirateurs jardin','Nettoyeurs haute pression','Tondeuses électriques','Taille-haies','Souffleurs','Débroussailleuses','Outils électriques jardin','Perceuses jardin','Visseuses jardin','Ponceuses jardin','Scies jardin','Compresseurs','Chargeurs de batterie jardin']),
  ('outils-electriques', array['Perceuses','Visseuses','Meuleuses','Scies','Ponceuses','Rabots','Défonceuses','Outils multifonctions','Batteries outils','Chargeurs outils','Coffrets d''outils']),
  ('automobile-electronique', array['Autoradios','GPS','Dashcams','Chargeurs voiture','Batteries auto','Câbles auto','Systèmes audio auto','Écrans auto','Accessoires électroniques auto']),
  ('bien-etre-appareils-personnels', array['Sèche-cheveux','Tondeuses personnelles','Rasoirs électriques','Appareils de coiffure','Balances connectées','Appareils de massage','Appareils de soin électrique']),
  ('professionnel', array['Matériel informatique professionnel','Équipements réseau','Serveurs professionnels','Imprimantes professionnelles','Matériel audiovisuel','Équipements électroniques industriels','Outils professionnels'])
) as v(cat_slug, names)
cross join lateral unnest(v.names) with ordinality as u(n, ord)
join categories c on c.slug = v.cat_slug
on conflict (category_id, slug) do nothing;

insert into brands (slug, name) values
  ('apple','Apple'),('samsung','Samsung'),('xiaomi','Xiaomi'),('google','Google'),('oneplus','OnePlus'),
  ('huawei','Huawei'),('sony','Sony'),('microsoft','Microsoft'),('nintendo','Nintendo'),('nvidia','Nvidia'),
  ('amd','AMD'),('intel','Intel'),('asus','Asus'),('msi','MSI'),('gigabyte','Gigabyte'),('lenovo','Lenovo'),
  ('hp','HP'),('dell','Dell'),('lg','LG'),('bosch','Bosch'),('dyson','Dyson'),('philips','Philips'),
  ('bose','Bose'),('jbl','JBL'),('canon','Canon'),('nikon','Nikon'),('dji','DJI'),('makita','Makita'),
  ('ecoflow','EcoFlow'),('anker','Anker'),('autre','Autre marque')
on conflict (slug) do nothing;

insert into category_attributes (category_id, subcategory_id, key, label, input_type, unit, options, is_required, display_order)
select c.id, sc.id, a.key, a.label, a.input_type::attribute_input_type, a.unit, a.options::jsonb, a.is_required, a.ord
from (values
  ('telephones-accessoires','iphone','storage_gb','Stockage','select','Go','["64","128","256","512","1000"]',true,1),
  ('telephones-accessoires','iphone','battery_health_percent','État de la batterie','number','%',null,false,2),
  ('telephones-accessoires','iphone','screen_condition','État de l''écran','select',null,'["Parfait","Micro-rayures","Rayures visibles","Fissure"]',true,3),
  ('telephones-accessoires','samsung','storage_gb','Stockage','select','Go','["64","128","256","512","1000"]',true,1),
  ('telephones-accessoires','samsung','battery_health_percent','État de la batterie','number','%',null,false,2),
  ('composants-pc','cartes-graphiques','vram_gb','Mémoire vidéo (VRAM)','select','Go','["4","6","8","10","12","16","20","24"]',true,1),
  ('composants-pc','cartes-graphiques','connectivity','Connectique','text',null,null,false,2),
  ('composants-pc','cartes-graphiques','power_consumption_w','Consommation','number','W',null,false,3),
  ('maison-electromenager','aspirateurs','power_watts','Puissance','number','W',null,false,1),
  ('maison-electromenager','aspirateurs','battery_autonomy_min','Autonomie batterie','number','min',null,false,2),
  ('maison-electromenager','aspirateurs-robots','battery_autonomy_min','Autonomie batterie','number','min',null,false,1)
) as a(cat_slug, sub_slug, key, label, input_type, unit, options, is_required, ord)
join categories c on c.slug = a.cat_slug
join subcategories sc on sc.category_id = c.id and sc.slug = a.sub_slug
on conflict (category_id, subcategory_id, key) do nothing;
