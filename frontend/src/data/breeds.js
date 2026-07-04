export const DOG_BREEDS = [
  { id: "criollo-dog", displayName: "Criollo", animalType: "dog" },
  { id: "labrador", displayName: "Labrador", animalType: "dog" },
  { id: "husky", displayName: "Husky", animalType: "dog" },
  { id: "yorkshire", displayName: "Yorkshire", animalType: "dog" },
  { id: "golden", displayName: "Golden", animalType: "dog" },
  { id: "shih-tzu", displayName: "Shih Tzu", animalType: "dog" },
  { id: "pug", displayName: "Pug", animalType: "dog" },
  { id: "schnauzer", displayName: "Schnauzer", animalType: "dog" },
  { id: "chihuahua", displayName: "Chihuahua", animalType: "dog" },
  { id: "pastor-aleman", displayName: "Pastor Alemán", animalType: "dog" },
  { id: "pitbull", displayName: "Pitbull", animalType: "dog" },
];

export const CAT_BREEDS = [
  { id: "criollo-cat", displayName: "Criollo", animalType: "cat" },
  { id: "persa", displayName: "Persa", animalType: "cat" },
  { id: "negro", displayName: "Negro", animalType: "cat" },
  { id: "siames", displayName: "Siamés", animalType: "cat" },
  { id: "bengali", displayName: "Bengalí", animalType: "cat" },
  { id: "himalayo", displayName: "Himalayo", animalType: "cat" },
  { id: "maine-coon", displayName: "Maine Coon", animalType: "cat" },
  { id: "ragdoll", displayName: "Ragdoll", animalType: "cat" },
  { id: "esfinge", displayName: "Esfinge", animalType: "cat" },
  { id: "britanico", displayName: "Británico", animalType: "cat" },
  { id: "ruso-azul", displayName: "Ruso Azul", animalType: "cat" },
];

export const BREEDS = [...DOG_BREEDS, ...CAT_BREEDS];

export const dogBreeds = DOG_BREEDS;
export const catBreeds = CAT_BREEDS;
export const breeds = BREEDS;
