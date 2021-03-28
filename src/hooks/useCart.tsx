import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const updated = [...cart]
      const alreadyExists = updated.find(product=> product.id === productId)
      const responseStock = await api.get(`/stock/${productId}`)

      const stockAmount = responseStock.data.amount
      const currentAmount = alreadyExists ? alreadyExists.amount : 0
      const amount = currentAmount + 1

      if(amount > stockAmount){
        toast.error('Quantidade solicitada fora de estoque');
        return
      }

      if(alreadyExists){
        alreadyExists.amount = amount
      }else{
        const response = await api.get(`products/${productId}`)
        const newItem = {
          ...response.data,
          amount: 1
        }
        updated.push(newItem)
      }

      setCart(updated)
      localStorage.setItem('@RocketShoes:cart',JSON.stringify(updated))
     
    } catch {
      // TODO
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const updated = [...cart]
      const index = updated.findIndex(product => product.id === productId)

      if(index >= 0){
        updated.splice(index,1)
        setCart(updated)
        localStorage.setItem('@RocketShoes:cart',JSON.stringify(updated))
      }else{
        throw Error();
      }
    } catch {
      // TODO
      toast.error('Erro na remoção do produto')
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if(amount <= 0){
        return
      }
      const stockResponse = await api.get(`/stock/${productId}`)
      const stockAmount = stockResponse.data.amount
      if(amount > stockAmount){
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      const updated = [...cart]
      const alreadyExists = updated.find(product => product.id === productId)

      if(alreadyExists){
        alreadyExists.amount = amount
        setCart(updated)
        localStorage.setItem('@RocketShoes:cart',JSON.stringify(updated))
      }else{
        throw Error()
      }
    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto')
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
