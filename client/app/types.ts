interface Product {
    id: number,
    title: string,
    description: string,
    image: string,
    price: number,
    author: string,
    brand: string,
    model: string,
    size: string,
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