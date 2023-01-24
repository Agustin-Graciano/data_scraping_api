import { useState, useEffect } from "react";
import "./App.css";
import NavBar from "./components/NavBar";
import { Button } from "@material-tailwind/react";

function App() {
  const [data, setData] = useState([]);
  const filterData = (data) => {
    const filterResult = data.filter(
      (object) => object.title == "2.54mm 1*40P Color Single Row Needle"
    );
    console.log(filterResult);
  };
  useEffect(() => {
    const fetchData = async () => {
      await fetch("http://localhost:5000/api")
        .then((response) => response.json())
        .then((data) => {
          setData(data);
          console.log(data[9].title);
        });
      filterData(data);
    };

    fetchData();
  }, []);

  // const filterData = (data) => {
  //   const filterResult = data.filter(
  //     (object) => object.title == "2.54mm 1*40P Color Single Row Needle"
  //   );
  //   console.log(filterResult);
  // };
  console.log(data[12]);
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

          <form method="post" action="http://localhost:5000/pyth">
            <div>
              <label class="inline-block ml-20 mt-10" />
              <input
                type="float"
                name="Price"
                className="ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="Price"
              />
              <div className="inline-block text-lg ml-4"></div>

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
                  type="string"
                  name="Currency"
                  className="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                  placeholder="Currency in 3 letters"
                />
              </label>
              <label className="inline-block ml-20 mt-10">
                <input
                  type="string"
                  name="OutsideEbits"
                  className="ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                  placeholder="OutsideEbits"
                />
              </label>
              <label className="inline-block ml-20 mt-10">
                <input
                  type="string"
                  name="OutsideEU"
                  className="ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                  placeholder="OutsideEU"
                />
              </label>
            </div>

            <div className="mt-10 text-xl text-center">
              Select wanted delivery date:
              <label className="inline-block" />
              <input
                type="date"
                name="Date"
                className="ml-2 mt-1 px-4 py-2 w-1/4 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="select date..."
              />
            </div>

            <div class="flex justify-center mt-5 mb-5">
              <Button
                type="submit"
                value="submit"
                class="m-5 p-2 bg-eggplant text-white rounded drop-shadow-lg"
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
