import { useColorMode, useColorModeValue } from "@chakra-ui/react";
import React from "react";

const BoldFirstCharacter = (props) => {
  const { colorMode } = useColorMode();

  // Use a regular expression to detect the numbered list pattern
  var text = String(props.text)

  const tx1 = useColorModeValue("black", "white");
  // Splitting the text into words
  let words = [];

  try {
    words = text.split(" ");
  } catch (error) {
    console.error("Failed to split the text:", error);
  }

  // Function to determine the number of characters to make bold based on word length
  const getNumberOfCharactersToBold = (word) => {
    if (word.length > 9) {
      return 4;
    } else if (word.length > 7) {
      return 3;
    } else if (word.length > 5) {
      return 2;
    } else {
      return 1;
    }
  };

  // Wrapping the specified number of characters in each word with <b> tags
  const boldCharacters = words.map((word, index) => {
    const numberOfCharactersToBold = getNumberOfCharactersToBold(word);
    const firstCharacters = word.slice(0, numberOfCharactersToBold);
    const restOfWord = word.slice(numberOfCharactersToBold);
    return (
      <span key={index}>
        <b style={{ color: `${tx1}` }}>{firstCharacters}</b>
        {restOfWord}{" "}
      </span>
    );
  });

  return <div>{boldCharacters}</div>;
};

export default BoldFirstCharacter;
