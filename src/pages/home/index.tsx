import { useState, useEffect } from "react";
import { Container } from "../../components/container";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import { Link } from "react-router-dom";

interface CarsProps{
  id: string;
  name: string;
  category: string,
  uid: string;
  price: string;
  city: string;
  images: CarImageProps[];
}

interface CarImageProps{
  name: string;
  uid: string;
  url: string;
}

export function Home() {
  const [cars, setCars] = useState<CarsProps[]>([])
  const [loadImages, setloadImages] = useState<string[]>([])
  const [input, setInput] = useState("")

  useEffect(() => {

    loadCars();
  },[])

  function loadCars(){
    const carsRef = collection(db, "cars")
    const queryRef = query(carsRef, orderBy("created", "desc"))

    getDocs(queryRef)
    .then((snapshot) => {
      const listcars = [] as CarsProps[];  

      snapshot.forEach( doc => {
        listcars.push({
          id: doc.id,
          name: doc.data().name,
          category: doc.data().category,
          city: doc.data().city,
          price: doc.data().price,
          images: doc.data().images,
          uid: doc.data().uid
        })
      })

      setCars(listcars)
    })

  }

  function handleImageLoad(id: string){
    setloadImages((prevImageloaded) => [...prevImageloaded, id])
  }

  async function handleSearchCh(){
    if(input === ''){
      loadCars();
      return;
    }

    setCars([]);
    setloadImages([]);

    const q = query(collection(db, "cars"), 
    where("category", ">=", input.toUpperCase() ), 
    where("category", "<=", input.toUpperCase() + "\uf8ff"))
    
    const querySnapshot = await getDocs(q)
    
    const listcars = [] as CarsProps[]

    querySnapshot.forEach((doc) => {
      listcars.push({
        id: doc.id,
        name: doc.data().name,
        category: doc.data().category,
        city: doc.data().city,
        price: doc.data().price,
        images: doc.data().images,
        uid: doc.data().uid
      })
    })

    setCars(listcars)
  }

  return (
    <Container>
      <section className="bg-white p-4 rounded-lg w-full max-w-3x1 mx-auto flex justify-center items-center gap-2">
        <input
        className="w-full border-2 rounded-lg h-9 px-3 outline-none"
          placeholder="Pinturas, Logos...."
          value={input}
          onChange={ (e) => setInput(e.target.value)}
        />
        <button
          className="bg-yellow-900 h-9 px-8 rounded-lg text-white font-medium text-lg"
          onClick={handleSearchCh}
        >
          Buscar  
        </button>
      </section>

      <h1 className="font-bold text-center mt-6 text-2x1 mb-4">
        Artes locais e de todo o Brasil
      </h1>

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

        {cars.map( car => (
          <Link key={car.id} to={`/car/${car.id}`}>
            <section className="w-full bg-white rounded-lg">
              <div 
                className="w-full h-72 rounded-lg bg-slate-200"
                style={{ display: loadImages.includes(car.id) ? "none" : "block" }}
              ></div>
              <img
                className="w-full rounded-lg md-2 max-h-72 hover:scale-105 transition-all"
                src={car.images[0].url}
                alt="Carros"
                onLoad={ () => handleImageLoad(car.id) }
                style={{ display: loadImages.includes(car.id) ? "block" : "none" }}
              />
              <p className="font-bold mt-1 mb-2 px-2">Artista: {car.name}</p>

              <div className="flex flex-col px-2">
                <span className="text-zinc-700 mb-6"> Categoria: {car.category}</span>
                <strong className="text-black font-medium text-xl"> {car.price}</strong>
              </div>

              <div className="w-full h-px bg-slate-200 my-2"></div>

              <div className="px-2 pb-2">
                <span className="text-zinc-700">
                  {car.city}
                </span>
              </div>
            </section>
          </Link>
        ))}

      </main>
    </Container>
  )
}
  
