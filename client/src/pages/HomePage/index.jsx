import {Home} from 'lucide-react'
import {useState , useEffect} from 'react'
import ProductCard from '../../components/ProductCard'
import {BeatLoader} from 'react-spinners'
import Carousel from '../../components/Carousel'
import About from '../../components/About'
import Contact from '../../components/Contact'
import TabItem from '../../components/TabItem'
import './index.css'

const tabsList = [
    { id: 1, tabName: "All" },
    { id: 2, tabName: "Shirts" },
    { id: 3, tabName: "Pants" },
    { id: 6, tabName: "Sweaters" },
    { id: 7, tabName: "T-Shirts" },
    { id: 8, tabName: "Outerwear" },
    { id: 10, tabName: "Accessories" },
    { id: 11, tabName: "Bottoms" },
    { id: 12, tabName: "Electronics" },
];


const HomePage = () => {
    const [searchInput , setSearchInput] = useState('');
    const [productsData , setProductsData] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [activeTabId , setActiveTabId] = useState(tabsList[0].id);
    const [isLoading , setisLoading] = useState(true);

    useEffect(() => {
    const getProductsData = async () => {
        const url = "http://localhost:3000/";
        const response = await fetch(url);
        const responseData = await response.json();

        const formattedData = responseData.map(eachProduct => ({
            id: eachProduct.id,
            title: eachProduct.title,
            handle: eachProduct.handle,
            productDescription: eachProduct.body_html,
            vendor: eachProduct.vendor,
            productType: eachProduct.product_type,
            tags: eachProduct.tags,
            images: eachProduct.images,
            category: eachProduct.category
        }));

        setAllProducts(formattedData);
        setProductsData(formattedData);
        setisLoading(false);
        }
        getProductsData();
    }, []);

    const onClickTab = (id) => {
        setActiveTabId(id);
        const selectedTab = tabsList.find(eachTab => eachTab.id === id);

        if (selectedTab.tabName === "All") {
            setProductsData(allProducts);
            return;
        }

        const filteredProducts = allProducts.filter(eachProduct => {
            return eachProduct.category === selectedTab.tabName;
        });

        setProductsData(filteredProducts);
    }

    const onChangeSearchInput = (event) => {
        const value = event.target.value;

        setSearchInput(value);

        const filteredData = allProducts.filter(eachProduct => {
            return eachProduct.title.toLowerCase().includes(value.toLowerCase());
        });

        setProductsData(filteredData);
    }

    const renderLoader = () => {
        return (
            <div className = "loading-view-container">
            <BeatLoader color = "#000" />
        </div>
        )
    }
    return (
        <div className = "home_container">
            <div className = "search_container">
                <input type="text" className = "home_input_container" placeholder = "Search..." onChange = {onChangeSearchInput} value={searchInput}/>
                <Home />
            </div>
            <Carousel />
            <ul className = "tabs-container">
                {
                    tabsList.map(eachTab => {
                        return (<TabItem id = {eachTab.id} tabDetails = {eachTab} onClick = {onClickTab}/>)
                    })
                }
            </ul>
            <div className="products_container">
                {isLoading ? (
                    renderLoader()
                ) : productsData.length === 0 ? (
                    <h1 classname = "no_products-heading">No products found in this category.</h1>
                ) : (
                    productsData.map(eachProduct => (
                    <ProductCard
                    key={eachProduct.id}
                    productDetails={eachProduct}
            />
        ))
    )}
</div>
            <About />
            <Contact />
        </div>
    )
}

export default HomePage
