import NavBar from './components/NavBar'

function App() {

  return (
    <><>
      <NavBar />
    </><div class='flex justify-center'>
        <div class='w-3/5'>
          <div class='mt-10 text-xl text-center'>Select wanted delivery date:
          <label class='inline-block'>
             <input type="date" name="date" class="ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 w-full rounded-md sm:text-sm focus:ring-1" placeholder="select date..." />
          </label>
          </div>

          <div>
          <label class='inline-block ml-20 mt-10'>
             <input type="string" name="Component" class="ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 w-full rounded-md sm:text-sm focus:ring-1" placeholder="Enter component name..." />
          </label>
          <label class='inline-block ml-20 mt-10'>
             <input type="int" name="Amount" class="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1" placeholder="Amount" />
          </label>
          <label class='inline-block ml-20 mt-10'>
             <input type="int" name="Price" class="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1" placeholder="Price" />
          </label>
          <div class='inline-block text-lg ml-4'>kr ex. VAT</div>
          </div>

          <div>
          <label class='inline-block ml-20 mt-6'>
             <input type="string" name="Component" class="ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 w-full rounded-md sm:text-sm focus:ring-1" placeholder="Enter component name..." />
          </label>
          <label class='inline-block ml-20 mt-6'>
             <input type="int" name="Amount" class="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1" placeholder="Amount" />
          </label>
          <label class='inline-block ml-20 mt-6'>
             <input type="int" name="Price" class="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1" placeholder="Price" />
          </label>
          <div class='inline-block text-lg ml-4'>kr ex. VAT</div>
          </div>

          <div>
          <label class='inline-block ml-20 mt-6'>
             <input type="string" name="Component" class="ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 w-full focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1" placeholder="Enter component name..." />
          </label>
          <label class='inline-block ml-20 mt-6'>
             <input type="int" name="Amount" class="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1" placeholder="Amount" />
          </label>
          <label class='inline-block ml-20 mt-6'>
             <input type="int" name="Price" class="w-24 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1" placeholder="Price" />
          </label>
          <div class='inline-block text-lg ml-4'>kr ex. VAT</div> 
          <div></div>
          </div>               

          <label class='block ml-20 mt-12'>
             <input type="string" name="name" class="w-1/4 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1" placeholder="Name" /> 
          </label>

          <label class='block ml-20 mt-4'>
             <input type="string" name="E-mail" class="w-1/4 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1" placeholder="E-mail" />
          </label>

          <label class='block ml-20 mt-4 mb-0'>
             <input type="int" name="number" class="w-1/4 ml-2 mt-1 px-4 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 rounded-md sm:text-sm focus:ring-1" placeholder="Phone number" />
          </label>
          
          <div class='flex justify-center mt-5 mb-5'>
          <button class="py-2 px-8 bg-eggplant text-white hover:bg-eg-eggplant rounded drop-shadow-lg">Send Quote</button></div>
         </div>
       </div></>
    )
}

export default App
