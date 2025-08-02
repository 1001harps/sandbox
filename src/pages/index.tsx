import { Link } from "react-router-dom";

export const IndexPage = () => {
  return (
    <>
      <ul className="list-disc pl-5">
        <li>
          <Link
            to="/drum-synth-prototype"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            drum synth prototype
          </Link>
        </li>
      </ul>
    </>
  );
};
