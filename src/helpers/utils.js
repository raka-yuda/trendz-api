const cleanTweet = (tweet) => {
  return tweet
    .replace(/(https?|ftp):\/\/[^\s/$.?#].[^\s]*/g, "") // Remove URLs
    .replace(/\s+/g, " ") // Remove white spaces
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF]/g, "") // Remove emojis
    .replace(/^\s+|\s+$/gm, ""); // Remove newlines
};


export {
  cleanTweet
};