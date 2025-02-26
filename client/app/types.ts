interface Product {
    id: number,
    title: string,
    description: string,
    image: string,
    price: number,
}

interface Category {
    id: number,
    name: string,
}

interface addProductProps {
    addProduct: (newProduct: Product) => void;
}