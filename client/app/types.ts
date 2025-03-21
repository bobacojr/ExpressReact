interface Product {
    id: number,
    title: string,
    description: string,
    image: string,
    price: number,
    size: string,
    color: string,
    author: string,
    brand: string,
    model: string,
    quantity: number,
    category_id: number,
}

interface Category {
    id: number,
    name: string,
}

interface addProductProps {
    addProduct: (newProduct: Product) => void;
}

interface ProductsProps {
    addingToCart: boolean;
    onAddingToCart: () => void;
    onClosePopup: () => void;
    cartItems: CartItem[];
    fetchCart: () => Promise<void>;
}

interface CartItem {
    id: number,
    title: string,
    description: string,
    image: string,
    price: number,
    size: string,
    color: string,
    author: string,
    brand: string,
    model: string,
    quantity: number,
    category_id: number,
}

