import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      <h1
        style={{
          marginBottom: "10px",
          marginLeft: "20px"
        }}
      >
        Hola Mundo!!
      </h1>
      <Link 
        to={"examples"}
        style={{
          cursor: "pointer",
          border: "1px solid black",
          padding: "10px",
          borderRadius: "10px",
          marginLeft: "20px"
        }}
      >
          Examples!
      </Link>
    </>
  )
}

export { Home };
