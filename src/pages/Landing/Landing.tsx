import { Center } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";

function Landing() {
  return (
    <Center>
      <Button textColor="black" bg="#00ffc4" as={Link} to="/home">
        Examples
      </Button>
      
    </Center>
  );
}

export { Landing };
