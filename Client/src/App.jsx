import { useState, useEffect } from "react";
import "./App.css";
import NavBar from "./components/NavBar";
import { Button } from "@material-tailwind/react";

function App() {
  const [data, setData] = useState([]);

  const [userSearch, setUserSearch] = useState("");

  const [output, setOutput] = useState("");

  const filterData = (data, inputCriteria) => {
    const filterResult = data.filter(
      (object) => object.title.toLowerCase() === inputCriteria.toLowerCase()
    );
    setOutput(filterResult);
    console.log(filterResult);
  };
  useEffect(() => {
    const fetchData = async () => {
      await fetch("http://localhost:5000/api")
        .then((response) => response.json())
        .then((data) => {
          setData(data);
        });
    };

    fetchData();
  }, []);

  return (
    <>
      <>
        <NavBar />
      </>
      <div className="flex justify-center">
        <div className="w-3/5">
          <div className="mt-10 text-xl text-center">
            Select wanted delivery date:
            <span className="">
              <input
                type="date"
                name="date"
                className="ml-2 mt-1 px-4 py-2 w-1/4 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="select date..."
              />
            </span>
          </div>

          <div>
            <span className="inline-block ml-20 mt-10">
              <input
                type="string"
                name="Component"
                className="ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="Enter component name..."
                onChange={(event) => {
                  setUserSearch(event.target.value);
                }}
              />
              {output.length !== 0 ? output.innerText : ""}
            </span>

            <span className="inline-block ml-20 mt-10">
              <input
                type="int"
                name="Amount"
                className="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="Amount"
              />
            </span>

            <span className="inline-block ml-20 mt-10">
              <input
                type="int"
                name="Price"
                className="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="Price"
              />
            </span>
            <div className="inline-block text-lg ml-4">kr ex. VAT</div>
          </div>

          <div>
            <span className="inline-block ml-20 mt-6">
              <input
                type="string"
                name="Component"
                className="ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="Enter component name..."
              />
            </span>

            <span className="inline-block ml-20 mt-6">
              <input
                type="int"
                name="Amount"
                className="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="Amount"
              />
            </span>

            <span className="inline-block ml-20 mt-6">
              <input
                type="int"
                name="Price"
                className="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="Price"
              />
            </span>

            <div className="inline-block text-lg ml-4">kr ex. VAT</div>
          </div>

          <div>
            <span className="inline-block ml-20 mt-6">
              <input
                type="string"
                name="Component"
                className="ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="Enter component name..."
              />
            </span>

            <span className="inline-block ml-20 mt-6">
              <input
                type="int"
                name="Amount"
                className="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="Amount"
              />
            </span>

            <span className="inline-block ml-20 mt-6">
              <input
                type="int"
                name="Price"
                className="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="Price"
              />
            </span>

            <div className="inline-block text-lg ml-4">kr ex. VAT</div>
            <div></div>
          </div>

          <span className="block ml-20 mt-12">
            <input
              type="string"
              name="name"
              className="w-1/4 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
              placeholder="Name"
            />
          </span>

          <span className="block ml-20 mt-4">
            <input
              type="string"
              name="E-mail"
              className="w-1/4 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
              placeholder="E-mail"
            />
          </span>

          <span className="block ml-20 mt-4 mb-0">
            <input
              type="int"
              name="number"
              className="w-1/4 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
              placeholder="Phone number"
            />
          </span>

          <form method="post" action="http://localhost:5000/pyth">
            <div>
              <span className="inline-block ml-20 mt-10">
                <input
                  type="float"
                  name="Price"
                  className="ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                  placeholder="Price"
                />
              </span>
              <div className="inline-block text-lg ml-4"></div>

              <span className="inline-block ml-20 mt-10">
                <input
                  type="int"
                  name="Amount"
                  className="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                  placeholder="Amount"
                />
              </span>

              <span className="inline-block ml-20 mt-10">
                <input
                  type="string"
                  name="Currency"
                  className="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                  placeholder="Currency in 3 letters"
                />
              </span>

              <span className="inline-block ml-20 mt-10">
                <input
                  type="string"
                  name="OutsideEbits"
                  className="ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                  placeholder="OutsideEbits"
                />
              </span>

              <span className="inline-block ml-20 mt-10">
                <input
                  type="string"
                  name="OutsideEU"
                  className="ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                  placeholder="OutsideEU"
                />
              </span>
            </div>

            <div className="mt-10 text-xl text-center">
              Select wanted delivery date:
              <span className="">
                <input
                  type="date"
                  name="Date"
                  className="ml-2 mt-1 px-4 py-2 w-1/4 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                  placeholder="select date..."
                />
              </span>
            </div>

            <div className="flex justify-center mt-5 mb-5">
              <Button
                onClick={
                  userSearch.length === 0
                    ? () => setOutput("Please fill out the field")
                    : () => filterData(data, userSearch)
                }
                value="submit"
                className="m-5 p-2 bg-eggplant text-white rounded drop-shadow-lg"
              >
                Send Quote
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default App;
