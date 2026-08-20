import { api } from './api';
export const adminData={
 dashboard:()=>api('/admin/dashboard'),
 products:(q='')=>api(`/admin/products?limit=100${q?`&q=${encodeURIComponent(q)}`:''}`),
 createProduct:(body:unknown)=>api('/admin/products',{method:'POST',body:JSON.stringify(body)}),
 updateProduct:(id:string,body:unknown)=>api(`/admin/products/${id}`,{method:'PATCH',body:JSON.stringify(body)}),
 archiveProduct:(id:string)=>api(`/admin/products/${id}`,{method:'DELETE'}),
 categories:()=>api('/admin/categories'),
 createCategory:(body:unknown)=>api('/admin/categories',{method:'POST',body:JSON.stringify(body)}),
 updateCategory:(id:string,body:unknown)=>api(`/admin/categories/${id}`,{method:'PATCH',body:JSON.stringify(body)}),
 deleteCategory:(id:string)=>api(`/admin/categories/${id}`,{method:'DELETE'}),
 inventory:()=>api('/admin/inventory'),
 adjustStock:(id:string,quantity:number,reason:string)=>api(`/admin/inventory/${id}`,{method:'PATCH',body:JSON.stringify({quantity,reason})}),
 orders:()=>api('/admin/orders'),
 order:(id:string)=>api(`/admin/orders/${id}`),
 updateOrder:(id:string,body:unknown)=>api(`/admin/orders/${id}`,{method:'PATCH',body:JSON.stringify(body)}),
 customers:()=>api('/admin/customers')
};
