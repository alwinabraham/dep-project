import React from 'react'

export default function Card({children,noPadding}) {
  let classes = 'bg-white shadow-xl rounded-md mb-5 overflow-hidden'
  if(!noPadding){
    classes+= ' p-1 sm:p-2 md:p-3 xl:p-4'
  }

  return (
    <div className={classes}>
        {children}
    </div>
  )
}
