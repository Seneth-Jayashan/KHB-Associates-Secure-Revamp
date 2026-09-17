import React, { useEffect, useState } from 'react'
import {Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';


export default function Allcategory({onCategorySelect , onCategoryDelete }) {

  const [categories, setCategories] = useState([]);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <TableContainer component={Paper}  className='mt-6 !rounded-2xl'> 
      <Table >
        <TableHead>
          <TableRow >
            <TableCell className='!font-bold !text-[14px] !uppercase !text-center'>Category ID</TableCell>
            <TableCell className='!font-bold !text-[14px] !uppercase !text-center'>Category Name</TableCell>
            <TableCell className='!font-bold !text-[14px] !uppercase !text-center'>Status</TableCell>
            <TableCell className='!font-bold !text-[14px] !uppercase !text-center'>Product Count</TableCell>
            <TableCell className='!font-bold !text-[14px] !uppercase !text-center'>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            categories.length > 0 ? categories.map(row =>(
              <TableRow  key={row.category_id}>
                <TableCell  className='!text-center'>{row.category_id}</TableCell>
                <TableCell className='!text-center'>{row.category_name}</TableCell>
                <TableCell  className='!text-center'>{row.category_status}</TableCell>
                <TableCell  className='!text-center'>{row.product_count}</TableCell>
                <TableCell>
                  <div className='flex gap-6 justify-center'>
                    <Button className='!bg-custom-gradient !px-4 !text-white hover:!bg-[#6610f2]' onClick={() => onCategorySelect({id:row.category_id , name: row.category_name})}  startIcon={<Edit/>}>Edit</Button>
                    <Button className='!bg-[#ff4c51] !text-white hover:!bg-[#ff0000] ' onClick={() => onCategoryDelete({id:row.category_id , name: row.category_name})} startIcon={<Delete/>}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6}>No Data Found</TableCell>
              </TableRow>
            )
          }
        </TableBody>
      </Table>
    </TableContainer>
  )
}
