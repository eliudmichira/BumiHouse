import React from 'react'

// import { listData } from '../../lib/dummydata';
import  Card  from '../card/card'
import "./list.scss"


const List = ({posts}) => {
  return (
    <div className='list'>
        {posts.map( property => (
            <Card key={property.id} property={property}/>
        ))}
    </div>
  )
}

export default List