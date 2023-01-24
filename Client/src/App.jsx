import { useState, useEffect } from "react";
import "./App.css";
import NavBar from "./components/NavBar";
import { Button } from "@material-tailwind/react";

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api")
      .then((response) => response.json())
      .then((data) => {
        setData(data);
      });
  }, []);

  console.log(data);

  // const fiterData = (data, input) => {
  //   data.filter((object) =>
  //     object
  //       .Object(object)
  //       .some((key) => key[o].toLowerCase().includes(input.toLowerCase()))
  //   );
  // };

  // console.log(fiterData(data, "UNO R3 Mega328P CH340 Development Board"));

  const filterData = (data, searchValue) => {
    // const filterResult = data.filter(
    //   (object) => object === searchValue.toLowerCase()
    // );
  };
  filterData;

  console.log(data);

  console.log(filterData(data, "2.54mm 1*40P Color Single Row Needle"));
  return (
    <>
      <>
        <NavBar />
      </>
      <div className="flex justify-center">
        <div className="w-3/5">
          <div className="mt-10 text-xl text-center">
            Select wanted delivery date:
            <label className="inline-block" />
            <input
              type="date"
              name="date"
              className="ml-2 mt-1 px-4 py-2 w-1/4 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
              placeholder="select date..."
            />
          </div>

          <div>
            <label class="inline-block ml-20 mt-10" />
            <input
              type="string"
              name="Component"
              className="ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
              placeholder="Enter component name..."
            />

            <label class="inline-block ml-20 mt-10">
              <input
                type="int"
                name="Amount"
                className="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="Amount"
              />
            </label>
            <label className="inline-block ml-20 mt-10">
              <input
                type="int"
                name="Price"
                className="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="Price"
              />
            </label>
            <div className="inline-block text-lg ml-4">kr ex. VAT</div>
          </div>

          <div>
            <label className="inline-block ml-20 mt-6">
              <input
                type="string"
                name="Component"
                className="ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="Enter component name..."
              />
            </label>
            <label className="inline-block ml-20 mt-6">
              <input
                type="int"
                name="Amount"
                className="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="Amount"
              />
            </label>
            <label className="inline-block ml-20 mt-6">
              <input
                type="int"
                name="Price"
                className="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="Price"
              />
            </label>
            <div className="inline-block text-lg ml-4">kr ex. VAT</div>
          </div>

          <div>
            <label className="inline-block ml-20 mt-6">
              <input
                type="string"
                name="Component"
                className="ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="Enter component name..."
              />
            </label>
            <label className="inline-block ml-20 mt-6">
              <input
                type="int"
                name="Amount"
                className="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="Amount"
              />
            </label>
            <label class="inline-block ml-20 mt-6">
              <input
                type="int"
                name="Price"
                className="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="Price"
              />
            </label>
            <div className="inline-block text-lg ml-4">kr ex. VAT</div>
            <div></div>
          </div>

          <label class="block ml-20 mt-12">
            <input
              type="string"
              name="name"
              className="w-1/4 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
              placeholder="Name"
            />
          </label>

          <label class="block ml-20 mt-4">
            <input
              type="string"
              name="E-mail"
              className="w-1/4 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
              placeholder="E-mail"
            />
          </label>

          <label class="block ml-20 mt-4 mb-0">
            <input
              type="int"
              name="number"
              className="w-1/4 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
              placeholder="Phone number"
            />
          </label>

          <div class="flex justify-center mt-5 mb-5">
            <Button class="m-5 p-2 bg-eggplant text-white rounded drop-shadow-lg">
              Send Quote
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
