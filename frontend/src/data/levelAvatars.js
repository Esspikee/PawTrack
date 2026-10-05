const levelAvatars = ["puppy", "level-tabby", "level-husky", "level-tuxedo", "level-siamese"];

export function getLevelAvatar(level) {
  return levelAvatars[Number(level) - 1] ?? "puppy";
}
