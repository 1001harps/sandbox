import { List } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export const IndexPage = () => {
  return (
    <>
      <List>
        <li>
          <Link to="/drum-synth-prototype">drum synth prototype</Link>
        </li>
      </List>
    </>
  );
};
