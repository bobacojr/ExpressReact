interface Product {
    id?: number;
    title?: string;
    description?: string;
    image?: string | File | null;
    price?: number;
    size?: string;
    color?: string;
    author?: string;
    brand?: string;
    model?: string;
    quantity?: number;
    category_id?: number;
    variants?: Variant[];
}

interface Category {
    id: number,
    name: string,
    parent_id?: number | null,
    subcategories?: Category[],
    parentName: string,
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

interface Variant {
    variant_id: number;
    variant_size?: string;
    variant_color?: string;
    variant_type?: string;
    variant_quantity: number;
    variant_price: number;
    variant_image: string,
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
    variant_id: number,
    variant_image: string,
    variant_price: number,
    variant_size: string,
    variant_color: string,
    variant_quantity: number,
}

