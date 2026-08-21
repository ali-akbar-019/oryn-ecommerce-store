import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'; import { api } from '../services/api';
export function useAddresses(){return useQuery({queryKey:['addresses'],queryFn:()=>api.get('/addresses')});}
export function useCreateAddress(){const qc=useQueryClient();return useMutation({mutationFn:(input:unknown)=>api.post('/addresses',input),onSuccess:()=>qc.invalidateQueries({queryKey:['addresses']})});}
export function useDeleteAddress(){const qc=useQueryClient();return useMutation({mutationFn:(id:string)=>api.del(`/addresses/${id}`),onSuccess:()=>qc.invalidateQueries({queryKey:['addresses']})});}
export function useUpdateProfile(){const qc=useQueryClient();return useMutation({mutationFn:(input:{firstName:string;lastName:string})=>api.patch('/auth/me',input),onSuccess:()=>qc.invalidateQueries({queryKey:['me']})});}
export function useChangePassword(){return useMutation({mutationFn:(input:{currentPassword:string;newPassword:string})=>api.patch('/auth/password',input)});}
export function useNotificationPreferences(){return useQuery({queryKey:['notification-preferences'],queryFn:()=>api.get('/notifications')});}
export function useSaveNotificationPreferences(){const qc=useQueryClient();return useMutation({mutationFn:(input:{orderUpdates:boolean;promotions:boolean;productAlerts:boolean})=>api.patch('/auth/preferences',input),onSuccess:()=>qc.invalidateQueries({queryKey:['notification-preferences']})});}
export function usePayMock(){const qc=useQueryClient();return useMutation({mutationFn:({orderId,outcome}:{orderId:string;outcome:'success'|'failure'})=>api.post(`/payments/${orderId}/mock`,{outcome}),onSuccess:()=>qc.invalidateQueries({queryKey:['orders']})});}
