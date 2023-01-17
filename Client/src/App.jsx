import { useState, useEffect } from "react";
import "./App.css";
import NavBar from "./components/NavBar";

function App() {
  const [data, setData] = useState({});

  useEffect(() => {
    fetch("/api")
      .then((response) => response.json())
      .then((data) => {
        setData(data);
      });
  }, []);

  console.log(data);

  return (
    <>
      <>
        <NavBar />
      </>
      <div class="flex justify-center">
        <div class="w-3/5">
          <div class="mt-10 text-xl text-center">
            Select wanted delivery date:
            <label className="inline-block">
              <input
                type="date"
                name="date"
                className="ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 w-full rounded-md sm:text-sm focus:ring-1"
                placeholder="select date..."
              />
            </label>
          </div>

          <div>
            <label class="inline-block ml-20 mt-10">
              <input
                type="string"
                name="Component"
                className="ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 w-full rounded-md sm:text-sm focus:ring-1"
                placeholder="Enter component name..."
              />
            </label>
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
                className="ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 w-full rounded-md sm:text-sm focus:ring-1"
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
                className="ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 w-full focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
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
            <button className="py-2 px-8 bg-eggplant text-white hover:bg-eg-eggplant rounded drop-shadow-lg">
              Send Quote
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
