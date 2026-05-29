import React, { useState } from 'react'
import "./SearchBar.scss";
import { Link } from 'react-router-dom';
// import { type } from 'express/lib/response';
const types = ["buy", "rent"];

function SearchBar () {
  const [query, setQuery] = useState({
    type: "buy",
    location: "",
    minPrice: 0,
    maxPrice: 0,
  });
  const switchType =(val)=>{
    setQuery((prev) =>  ({ ...prev, type:val}));
  };

  const handleChange = (e) =>{
    setQuery((prev) => ({...prev, [e.target.name]: e.target.value}));
  }
  return (
    <div className="searchBar">
      <div className='type'>
      {types.map((type)=>(
        <button key={type} onClick={()=>switchType(type)}
        className={query.type === type ? "active":""}>{type}</button>
      ))}     
      </div>

      <form>
      <input type='text' name='city' placeholder='City' onChange={handleChange}/>
      <input
      type='number'
      name='minPrice'
      min={0}
      max={1000000}
      placeholder='Min Price'
       onChange={handleChange} 
      />
      <input
        type='number'
        name='maxPrice' 
        min={0}
        max={1000000}
        placeholder='Max price'
        onChange={handleChange}
      />
      <Link to={`/list?type=${query.type}&city=${query.city}&minPrice=${query.minPrice}&maxPrice=${query.maxPrice}`}>
      <button>
        <img src='/search.png'></img>
      </button>
      </Link>
      
      </form>
    </div>
  )
}

export default SearchBar