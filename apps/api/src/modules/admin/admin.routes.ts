import { Router } from 'express';
import { prisma } from '@oryn/database';
import { z } from 'zod';
import { asyncHandler, AppError, sendData } from '../../common/http';
import { requireAdmin, } from '../../middleware/admin';
import type { AuthRequest } from '../../middleware/auth';

const productSchema = z.object({
  name: z.string().min(2), slug: z.string().min(2), brand: z.string().optional().nullable(), description: z.string().optional().nullable(),
  status: z.enum(['DRAFT','ACTIVE','ARCHIVED']).default('DRAFT'), categoryId: z.string(),
  images: z.array(z.object({ url: z.string().url(), altText: z.string().optional(), sortOrder: z.number().int().min(0).default(0) })).default([]),
  variants: z.array(z.object({ sku: z.string().min(2), price: z.coerce.number().nonnegative(), compareAtPrice: z.coerce.number().nonnegative().optional().nullable(), stockQuantity: z.coerce.number().int().min(0).default(0), attributes: z.record(z.string(), z.unknown()).default({}) })).default([])
});
const categorySchema = z.object({ name: z.string().min(2), slug: z.string().min(2), description: z.string().optional().nullable(), parentId: z.string().optional().nullable() });
const stockSchema = z.object({ quantity: z.coerce.number().int().min(0), reason: z.string().min(2).default('ADMIN_ADJUSTMENT') });
const orderSchema = z.object({ status: z.enum(['PENDING','CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','RETURNED']), paymentStatus: z.enum(['PENDING','PAID','FAILED','REFUNDED','CANCELLED']).optional() });

export const adminRouter = Router();
adminRouter.use(requireAdmin);

adminRouter.get('/dashboard', asyncHandler(async (_req,res) => {
  const [products, orders, customers, paid, pendingOrders, lowStock, recentOrders, topProducts] = await Promise.all([
    prisma.product.count({ where: { status: 'ACTIVE' }}),
    prisma.order.count(),
    prisma.user.count({ where: { role: { name: 'Customer' }}}),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' }}),
    prisma.order.count({ where: { status: { in: ['PENDING','CONFIRMED','PROCESSING'] }}}),
    prisma.productVariant.count({ where: { OR: [{ stockQuantity: 0 }, { stockQuantity: { lt: 10 }}] }}),
    prisma.order.findMany({ take: 8, orderBy: { createdAt: 'desc' }, select: { id:true,total:true,status:true,paymentStatus:true,createdAt:true,user:{select:{firstName:true,lastName:true,email:true}} } }),
    prisma.orderItem.groupBy({ by:['productId'], _sum:{quantity:true}, orderBy:{_sum:{quantity:'desc'}}, take:5 })
  ]);
  const productIds=topProducts.map(x=>x.productId);
  const productsById=productIds.length?await prisma.product.findMany({where:{id:{in:productIds}},select:{id:true,name:true}}):[];
  const names=new Map(productsById.map(x=>[x.id,x.name]));
  sendData(res, { products, orders, customers, revenue: Number(paid._sum.total ?? 0), pendingOrders, lowStock, recentOrders, topProducts: topProducts.map(x=>({productId:x.productId,name:names.get(x.productId)??'Unknown product',quantity:x._sum.quantity??0})) });
}));

adminRouter.get('/products', asyncHandler(async (req,res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const page = Math.max(Number(req.query.page ?? 1), 1); const limit = Math.min(Math.max(Number(req.query.limit ?? 25), 1), 100);
  const where = q ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }] } : {};
  const [items,total] = await Promise.all([
    prisma.product.findMany({ where, include: { category: true, images: { orderBy: { sortOrder:'asc' }, take:1 }, variants: { include: { inventory:true } } }, orderBy:{ updatedAt:'desc' }, skip:(page-1)*limit, take:limit }),
    prisma.product.count({ where })
  ]);
  sendData(res,{items,page,limit,total,pages:Math.ceil(total/limit)});
}));
adminRouter.post('/products', asyncHandler(async (req,res) => {
  const input = productSchema.parse(req.body);
  const existing = await prisma.product.findUnique({ where:{ slug:input.slug }}); if(existing) throw new AppError(409,'SLUG_IN_USE','Product slug already exists.');
  const product = await prisma.product.create({ data: {
    name:input.name, slug:input.slug, brand:input.brand, description:input.description, status:input.status, categoryId:input.categoryId,
    images:{ create: input.images }, variants:{ create: input.variants.map(v => ({ sku:v.sku, price:v.price, compareAtPrice:v.compareAtPrice, stockQuantity:v.stockQuantity, attributes:v.attributes, inventory:{ create:{ quantity:v.stockQuantity }}})) }
  }, include:{ category:true, images:true, variants:{ include:{ inventory:true }}} });
  sendData(res,product,201);
}));
adminRouter.get('/products/:id', asyncHandler(async(req,res)=>{
  const product=await prisma.product.findUnique({where:{id:req.params.id},include:{category:true,images:{orderBy:{sortOrder:'asc'}},variants:{include:{inventory:true}},attributes:{include:{values:true}}}});
  if(!product) throw new AppError(404,'PRODUCT_NOT_FOUND','Product not found.'); sendData(res,product);
}));
adminRouter.patch('/products/:id', asyncHandler(async(req,res)=>{
  const input = productSchema.partial().parse(req.body);
  const product=await prisma.product.update({where:{id:req.params.id},data:{name:input.name,slug:input.slug,brand:input.brand,description:input.description,status:input.status,categoryId:input.categoryId}});
  sendData(res,product);
}));
adminRouter.delete('/products/:id', asyncHandler(async(req,res)=>{ await prisma.product.update({where:{id:req.params.id},data:{status:'ARCHIVED'}}); sendData(res,{id:req.params.id,archived:true}); }));

adminRouter.get('/categories', asyncHandler(async(_req,res)=>sendData(res,await prisma.category.findMany({include:{_count:{select:{products:true,children:true}}},orderBy:{name:'asc'}}))));
adminRouter.post('/categories', asyncHandler(async(req,res)=>sendData(res,await prisma.category.create({data:categorySchema.parse(req.body)}),201)));
adminRouter.patch('/categories/:id', asyncHandler(async(req,res)=>sendData(res,await prisma.category.update({where:{id:req.params.id},data:categorySchema.partial().parse(req.body)}))));
adminRouter.delete('/categories/:id', asyncHandler(async(req,res)=>{const count=await prisma.product.count({where:{categoryId:req.params.id}});if(count)throw new AppError(409,'CATEGORY_HAS_PRODUCTS','Move products before deleting this category.');await prisma.category.delete({where:{id:req.params.id}});sendData(res,{id:req.params.id,deleted:true});}));

adminRouter.get('/inventory', asyncHandler(async(_req,res)=>sendData(res,await prisma.productVariant.findMany({include:{product:{select:{id:true,name:true,slug:true}},inventory:true},orderBy:{updatedAt:'desc'}}))));
adminRouter.patch('/inventory/:variantId', asyncHandler(async(req,res)=>{
  const input=stockSchema.parse(req.body); const variant=await prisma.productVariant.findUnique({where:{id:req.params.variantId},include:{inventory:true}}); if(!variant)throw new AppError(404,'VARIANT_NOT_FOUND','Variant not found.');
  const current=variant.inventory?.quantity ?? variant.stockQuantity; const delta=input.quantity-current;
  const result=await prisma.$transaction(async(tx)=>{const inventory=variant.inventory?await tx.inventory.update({where:{variantId:variant.id},data:{quantity:input.quantity}}):await tx.inventory.create({data:{variantId:variant.id,quantity:input.quantity}});await tx.productVariant.update({where:{id:variant.id},data:{stockQuantity:input.quantity}});await tx.inventoryTransaction.create({data:{inventoryId:inventory.id,quantityDelta:delta,reason:input.reason}});return inventory;}); sendData(res,result);
}));

adminRouter.get('/orders', asyncHandler(async(req,res)=>{const status=typeof req.query.status==='string'?req.query.status:undefined;sendData(res,await prisma.order.findMany({where:status?{status:status as never}:undefined,include:{user:{select:{id:true,email:true,firstName:true,lastName:true}},items:true,payment:true,address:true},orderBy:{createdAt:'desc'},take:100}));}));
adminRouter.get('/orders/:id', asyncHandler(async(req,res)=>{const order=await prisma.order.findUnique({where:{id:req.params.id},include:{user:true,address:true,items:{include:{product:true,variant:true}},payment:{include:{transactions:true}},statusHistory:{orderBy:{createdAt:'asc'}}}});if(!order)throw new AppError(404,'ORDER_NOT_FOUND','Order not found.');sendData(res,order);}));
adminRouter.patch('/orders/:id', asyncHandler(async(req,res)=>{
  const input=orderSchema.parse(req.body);
  const current=await prisma.order.findUnique({where:{id:req.params.id}});
  if(!current) throw new AppError(404,'ORDER_NOT_FOUND','Order not found.');
  const order=await prisma.$transaction(async tx=>{
    const updated=await tx.order.update({where:{id:req.params.id},data:{status:input.status,paymentStatus:input.paymentStatus}});
    if(current.status!==input.status){
      await tx.orderStatusHistory.create({data:{orderId:updated.id,status:input.status,note:`Order status updated to ${input.status.replaceAll('_',' ').toLowerCase()}.`}});
      await tx.notification.create({data:{userId:updated.userId,type:'ORDER_UPDATE',title:'Your order was updated',body:`Your order is now ${input.status.replaceAll('_',' ').toLowerCase()}.`,deepLink:`/orders/${updated.id}`}});
    }
    return updated;
  });
  const actor=(req as AuthRequest).user!;
  await prisma.adminAuditLog.create({data:{actorId:actor.id,action:'UPDATE_ORDER',resource:'Order',resourceId:order.id,metadata:{status:input.status,paymentStatus:input.paymentStatus}}});
  sendData(res,order);
}));

adminRouter.get('/customers', asyncHandler(async(_req,res)=>sendData(res,await prisma.user.findMany({where:{role:{name:'Customer'}},select:{id:true,email:true,firstName:true,lastName:true,status:true,createdAt:true,_count:{select:{orders:true,reviews:true}}},orderBy:{createdAt:'desc'},take:200}))));
adminRouter.get('/customers/:id', asyncHandler(async(req,res)=>{const customer=await prisma.user.findFirst({where:{id:req.params.id,role:{name:'Customer'}},select:{id:true,email:true,firstName:true,lastName:true,status:true,createdAt:true,addresses:true,orders:{orderBy:{createdAt:'desc'},take:20,include:{items:true,payment:true}},reviews:{orderBy:{createdAt:'desc'},include:{product:{select:{id:true,name:true}}}}}});if(!customer)throw new AppError(404,'CUSTOMER_NOT_FOUND','Customer not found.');sendData(res,customer);}));
adminRouter.get('/inventory/:variantId/history', asyncHandler(async(req,res)=>{const variant=await prisma.productVariant.findUnique({where:{id:req.params.variantId},include:{inventory:{include:{transactions:{orderBy:{createdAt:'desc'},take:100}}}}});if(!variant?.inventory)throw new AppError(404,'INVENTORY_NOT_FOUND','Inventory record not found.');sendData(res,{variantId:variant.id,sku:variant.sku,transactions:variant.inventory.transactions});}));
adminRouter.get('/reviews', asyncHandler(async(_req,res)=>sendData(res,await prisma.review.findMany({include:{product:{select:{id:true,name:true}},user:{select:{id:true,firstName:true,lastName:true,email:true}}},orderBy:{createdAt:'desc'},take:200}))));
adminRouter.get('/reviews/:id', asyncHandler(async(req,res)=>{const review=await prisma.review.findUnique({where:{id:req.params.id},include:{product:true,user:true}});if(!review)throw new AppError(404,'REVIEW_NOT_FOUND','Review not found.');sendData(res,review);}));
adminRouter.patch('/reviews/:id', asyncHandler(async(req,res)=>{const input=z.object({approved:z.boolean()}).parse(req.body);const review=await prisma.review.update({where:{id:req.params.id},data:{approved:input.approved}});const actor=(req as AuthRequest).user!;await prisma.adminAuditLog.create({data:{actorId:actor.id,action:input.approved?'APPROVE_REVIEW':'REJECT_REVIEW',resource:'Review',resourceId:review.id,metadata:{approved:input.approved}}});sendData(res,review);}));


const couponSchema=z.object({code:z.string().min(3).max(32),type:z.enum(['PERCENTAGE','FIXED']),value:z.coerce.number().positive(),startsAt:z.coerce.date(),expiresAt:z.coerce.date().optional().nullable(),maxUses:z.coerce.number().int().positive().optional().nullable(),maxUsesPerUser:z.coerce.number().int().positive().optional().nullable(),active:z.boolean().default(true)});
const shippingSchema=z.object({name:z.string().min(2),description:z.string().optional().nullable(),price:z.coerce.number().nonnegative(),active:z.boolean().default(true)});
const notificationSchema=z.object({userId:z.string(),type:z.string().min(2),title:z.string().min(2),body:z.string().min(2),deepLink:z.string().optional().nullable()});
const returnSchema=z.object({status:z.enum(['REQUESTED','APPROVED','REJECTED','RECEIVED','REFUNDED','CANCELLED']),notes:z.string().optional().nullable()});
const adminSchema=z.object({firstName:z.string().min(2),lastName:z.string().min(2),email:z.string().email(),password:z.string().min(10),roleId:z.string()});
const roleSchema=z.object({name:z.string().min(2)});

adminRouter.get('/coupons',asyncHandler(async(_req,res)=>sendData(res,await prisma.coupon.findMany({include:{usages:true},orderBy:{createdAt:'desc'}}))));
adminRouter.post('/coupons',asyncHandler(async(req,res)=>{const input=couponSchema.parse(req.body);const coupon=await prisma.coupon.create({data:{...input,code:input.code.toUpperCase()}});sendData(res,coupon,201)}));
adminRouter.get('/returns',asyncHandler(async(_req,res)=>sendData(res,await prisma.return.findMany({include:{user:{select:{firstName:true,lastName:true,email:true}},order:{select:{id:true,total:true,status:true}},items:true},orderBy:{createdAt:'desc'},take:200}))));
adminRouter.patch('/returns/:id',asyncHandler(async(req,res)=>{const input=returnSchema.parse(req.body);const item=await prisma.return.update({where:{id:req.params.id},data:{status:input.status,notes:input.notes}});const actor=(req as AuthRequest).user!;await prisma.adminAuditLog.create({data:{actorId:actor.id,action:'UPDATE_RETURN',resource:'Return',resourceId:item.id,metadata:{status:input.status}}});sendData(res,item)}));
adminRouter.get('/payments',asyncHandler(async(_req,res)=>sendData(res,await prisma.payment.findMany({include:{transactions:true,order:{select:{id:true,user:{select:{firstName:true,lastName:true,email:true}}}}},orderBy:{createdAt:'desc'},take:200}))));
adminRouter.get('/shipping',asyncHandler(async(_req,res)=>sendData(res,await prisma.shippingMethod.findMany({orderBy:{createdAt:'desc'}}))));
adminRouter.post('/shipping',asyncHandler(async(req,res)=>sendData(res,await prisma.shippingMethod.create({data:shippingSchema.parse(req.body)}),201)));
adminRouter.patch('/shipping/:id',asyncHandler(async(req,res)=>sendData(res,await prisma.shippingMethod.update({where:{id:req.params.id},data:shippingSchema.partial().parse(req.body)}))));
adminRouter.get('/notifications',asyncHandler(async(_req,res)=>sendData(res,await prisma.notification.findMany({include:{user:{select:{firstName:true,lastName:true,email:true}}},orderBy:{createdAt:'desc'},take:200}))));
adminRouter.post('/notifications',asyncHandler(async(req,res)=>sendData(res,await prisma.notification.create({data:notificationSchema.parse(req.body)}),201)));
adminRouter.get('/administrators',asyncHandler(async(_req,res)=>sendData(res,await prisma.user.findMany({where:{role:{name:{in:['Platform Owner','Administrator']}}},include:{role:true},orderBy:{createdAt:'desc'}}))));
adminRouter.post('/administrators',asyncHandler(async(req,res)=>{const input=adminSchema.parse(req.body);const exists=await prisma.user.findUnique({where:{email:input.email.toLowerCase()}});if(exists)throw new AppError(409,'EMAIL_IN_USE','An account with this email already exists.');const crypto=await import('node:crypto');const {promisify}=await import('node:util');const scrypt=promisify(crypto.scrypt);const salt=crypto.randomBytes(16);const derived=await scrypt(input.password,salt,64) as Buffer;const passwordHash=`${salt.toString('hex')}:${derived.toString('hex')}`;const user=await prisma.user.create({data:{firstName:input.firstName,lastName:input.lastName,email:input.email.toLowerCase(),passwordHash,roleId:input.roleId},include:{role:true}});sendData(res,user,201)}));
adminRouter.get('/roles',asyncHandler(async(_req,res)=>sendData(res,await prisma.role.findMany({include:{users:{select:{id:true}},permissions:{include:{permission:true}}},orderBy:{name:'asc'}}))));
adminRouter.post('/roles',asyncHandler(async(req,res)=>sendData(res,await prisma.role.create({data:roleSchema.parse(req.body)}),201)));
adminRouter.get('/audit-logs',asyncHandler(async(_req,res)=>sendData(res,await prisma.adminAuditLog.findMany({include:{actor:{select:{firstName:true,lastName:true,email:true}}},orderBy:{createdAt:'desc'},take:300}))));
