"use client"
import { useState } from "react";

export interface LocationData {
    Starting: string;
    Destination: string;        
}


export default function LocationEntries() {
    const [data, setData] = useState<LocationData>({
        Starting: '',
        Destination: ''
        });

    const [routeData,setRouteData] = useState<LocationData | null>(null);

    const handleSubmit = async (e:any) => {
      e.preventDefault();
      
        setRouteData(data);
    }
        

    const onChange = (e:React.ChangeEvent<HTMLInputElement>) : void => {
        const {name,value} = e.currentTarget;
        setData({...data,[name]:value});
    }

    return(
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" action="#" method="POST">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
               Starting
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="Starting"
                  value={data.Starting}
                  onChange={(e) => onChange(e)}    
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="Destination"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
               Destination
              </label>
              <div className="mt-2">
                <input
                  id="Destination"
                  name="Destination"
                  value={data.Destination}
                  onChange={(e) => onChange(e)}    

                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div></div>
            <div>
              <button
                onClick={handleSubmit}
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Set Destination
              </button>
            </div>
          </form>
        </div>
      </div>
    ) 
        
   
}