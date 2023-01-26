import { useState, useEffect } from "react";
import "./App.css";
import NavBar from "./components/NavBar";
import { Button } from "@material-tailwind/react";

function App() {
  //Variables for the data scraping API
  const [data, setData] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [outputObj, setOutputObj] = useState("");
  const [output, setOutput] = useState("");
  const [amount, setAmount] = useState("");

  var [formDate, setformDate] = useState("");
  var [formResult, setformResult] = useState("");

  //Function to set the earliest you would want deliveries to be available.
  function setMinDays(deliveryDate, minDays) {
      const oneDayMs = 86400000;
      const todayDate = new Date().setHours(0, 0, 0, 0).valueOf();
      const receivedDate = new Date(formDate).valueOf();
      const timeDiff = receivedDate - todayDate;
      const customDaysMs = oneDayMs * minDays;
      if (timeDiff > customDaysMs) {
          return true;
      }
      return false;
  }
  //Function to check whether a string is an integer. Now with added leading zeroes and leading whitespace support!
  function isStringInteger(str) {
      str = str.trim();
      if (!str) {
          return false;
      }
      str = str.replace(/^0+/, "");
      var n = Math.floor(Number(str));
      return n !== Infinity && String(n) === str && n >= 0;
    }

  //useEffect
  useEffect(() => {
    //Getting the scraped data from the server side
    const fetchData = async () => {
      await fetch("http://localhost:5000/api")
        .then((response) => response.json())
        .then((data) => {
          setData(data);
        });
    };

    fetchData();
  }, []);
    //Does the posting that is expected to happen when running handlePost.
    //Also checks date for whether it's anything, and whether it's after the earliest delivery date.
  const PostForm = () => {
      setformResult('');
      console.log(amount);
      if (formDate != "" && outputObj && isStringInteger(amount)) {
          //adjust the 7 for the amount of minimum weekdays you would want.
          var minDaysDelivery = 7;
          console.log(outputObj);
          var price = outputObj.price.slice(1);
          var currency = outputObj.price.substr(0, 1);
          if (currency == "$") {
              currency = "USD";
          }
          console.log(price);
          if (setMinDays(formDate, minDaysDelivery)) {
              fetch("http://localhost:5000/pyth",
                      {
                          method: "POST",
                          headers: {
                              "Content-Type": "application/json"
                          },
                          body: JSON.stringify({
                              Price: (outputObj.price.slice(1)),
                              Amount: amount,
                              Currency: currency,
                              OutsideEbits: "True",
                              OutsideEU: "True",
                              Date: formDate
                          })
                      })
                  .then((response) => response.text())
                  .then((formResult) => {
                      setformResult("Approx. " + (parseFloat(formResult.replace(',', '.'))) + " dkk.-");
                      console.log("Received: ", (parseFloat(formResult.replace(',', '.'))));
                  });
          } else {
              setformResult('Unfortunately, delivery is only available after ' + minDaysDelivery + " days.");
          }

      }
      else if (!formDate) {
          setformResult('Please input a delivery date.');
      }
      else if (!outputObj) {
          setformResult('Please input the name of a component you want to the side.');
      }
      else if (!isStringInteger(amount)) {
          setformResult('Amount is not a proper positive integer. Try harder.');
      }
  };
  //in a form with onsubmit="handlePost", the form doesn't post normally but instead runs this.
  var handlePost = (event) => {
    event.preventDefault();
    PostForm();
  };
  var handleChange = (event) => {
    setformDate(event.target.value);
  };

  //Data filtering function (TRIGGERED BY A BUTTON)
  const filterData = (data, inputCriteria) => {
    const filterResult = data.filter(
      (object) => object.title.toLowerCase() === inputCriteria.toLowerCase()
    );
    //Checks if there is a result from the filtering
    filterResult.length !== 0
      ? //If yes, sets the output to be equal to the result that fit the filtering criteria
        (setOutput(filterResult[0]?.title), setOutputObj(filterResult[0]))
      : setOutput("No product found");
    console.log(filterResult);
  };

  return (
    //XML part
    <>
      <>
        <NavBar />
      </>
      <div className="flex justify-center">
        <div className="w-3/5">
        
        <div>
          <form onSubmit={handlePost}>
            <div className="mt-10 text-xl text-center">
              Select wanted delivery date:
              <span className="">
                <input
                  type="date"
                  name="formDate"
                  value={formDate}
                  onChange={handleChange}
                  className="ml-2 mt-1 px-4 py-2 w-1/4 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                  placeholder="select date..."
                />
              </span>
            </div>
          </form>
          <p>
            <strong>{formResult}</strong>
          </p>
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
              {output ? (
                <h2>{output}</h2>
              ) : (
                <h2>No product with that name, check the spelling</h2>
              )}
            </span>

            <span className="inline-block ml-20 mt-10">
              <input
                type="int"
                name="Amount"
                onChange={(event) => {
                    setAmount(event.target.value);
                }}
                className="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="Amount"
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
                  {output ? (
                              <h2>{output}</h2>
                          ) : (
                              <h2>No product with that name, check the spelling</h2>
                          )}
              </span>
            
            <span className="inline-block ml-20 mt-6">
              <input
                type="int"
                name="Amount"
                className="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="Amount"
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
                  {output ? (
                              <h2>{output}</h2>
                          ) : (
                              <h2>No product with that name, check the spelling</h2>
                          )}
              </span>

            <span className="inline-block ml-20 mt-6">
              <input
                type="int"
                name="Amount"
                className="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1"
                placeholder="Amount"
              />
            </span>
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

          <div className="flex justify-center mt-5 mb-5">
              <Button
                onClick={
                  userSearch.length === 0
                    ? () => setOutput("Please fill out the field")
                    : () => filterData(data, userSearch)
                }
                value="submit"
                type="submit"
                className="m-5 p-2 bg-eggplant text-white rounded drop-shadow-lg"
              >
                Send Quote
              </Button>
            </div>

        </div>   
      </div>
    </>
  );
}

export default App;
