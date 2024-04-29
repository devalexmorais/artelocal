import { Container } from '../../../components/container'
import { DashboardHeader } from '../../../components/panelheader'

import { FiUpload, FiTrash } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import { Input } from '../../../components/input'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChangeEvent, useState, useContext } from 'react'
import { AuthContext } from '../../../contexts/AuthContext'
import { v4 as uuidV4 } from 'uuid'

import { storage, db } from '../../../services/firebaseConnection'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import {addDoc, collection } from 'firebase/firestore'

import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(1, "O campo nome é obrigatório"),
  category: z.string().min(1, "A categoria é obrigatório"),
  price:z.string().min(1, "O preço é obrigatório"),
  city:z.string().min(1, "A cidade é obrigatório"),
  whatsapp:z.string().min(1, "O Telefone é obrigatório").refine((value) => /^(\d{11,12})$/.test(value),{
    message: "Numero de telefone invalido."
  }),
  description:z.string().min(1, "A descrição é obrigatório"),
})

type FormData = z.infer<typeof schema>;

interface ImageItemProps{
  uid: string;
  name: string;
  previewUrl: string;
  url: string;
}

export function New() {
  const { user } = useContext(AuthContext)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange"
  })

  const [ carImages, setCarImages] = useState<ImageItemProps[]>([])


  async function handleUpload(image: File){
    if(!user?.uid){
      return;
    }

    const currentUid = user?.uid;
    const uidImage = uuidV4();

    const uploadRef = ref(storage, `image/${currentUid}/${uidImage}`)

    uploadBytes(uploadRef, image)
    .then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadUrl) => {
        const imageItem = {
          name: uidImage,
          uid: currentUid,
          previewUrl: URL.createObjectURL(image),
          url: downloadUrl,
        }

        setCarImages((images) => [...images, imageItem] )
        toast.success("Imagem cadastrada com sucesso! ");
      })
    })
  }

  async function handleFile(e:ChangeEvent<HTMLInputElement>){
    if(e.target.files && e.target.files[0]){
      const image = e.target.files[0]

      if(image.type === 'image/jpeg' || image.type === 'image/png'){
        await handleUpload(image)
      }else{
        alert("Envie uma imagem jpeg ou png!")
        return
      }
    }
  }

  function onsubmit(data: FormData){
    
    if(carImages.length === 0){
      toast.error("Envie pelo menos uma imagem!");
      
      return;
    }

    const carListImages = carImages.map( car => {
      return{
        uid: car.uid,
        name: car.name,
        url: car.url
      }
    })

    addDoc(collection(db, "cars"), {
      name: data.name,
      category: data.category.toUpperCase(),
      whatsapp: data.whatsapp,
      city: data.city,
      price: data.price,
      description: data.description,
      created: new Date(),
      owner: user?.name,
      uid: user?.uid,
      images: carListImages
    })
    .then(() => {
      reset();
      setCarImages([]);
      toast.success("Carro cadastrado com sucesso!");
      console.log("Cadastrado com sucesso!")
    })
    .catch((error) => {
      console.log(error)
      toast.error("Erro ao mandar imagem!");
    })
  }

  async function handleDeleteImage(item: ImageItemProps){
    const imagePath = `image/${item.uid}/${item.name}`

    const imageRef = ref(storage, imagePath);

    try{
      await deleteObject(imageRef)
      setCarImages(carImages.filter((car) => car.url !== item.url))
    }catch(error){
      console.log("Erro ao deletar", error)
    }
  }

  return (
    <Container>
      <DashboardHeader/>

      <div className='w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2'>
        <button className='border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48'>
          <div className='absolute cursor-pointer'>
            <FiUpload size={30} color='#000'/>
          </div>
          <div className='cursor-pointer'>
            <input type='file' accept='image/*' className='opacity-0 cursor-pointer' onChange={handleFile}/>
          </div>
        </button>

        {carImages.map( item => (
          <div key={item.name} className='w-full h-32 flex items-center justify-center relative'>
            <button className='absolute' onClick={() => handleDeleteImage(item)}>
              <FiTrash size={28} color='#FFF'/>
            </button>
            <img
              src={item.previewUrl}
              className='rounded-lg w-full h-32 object-cover'
              alt='foto do carro'
            />
          </div>
        ))}
      </div>

      <div className='w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2'>
        <form
          className='w-full'
          onSubmit={handleSubmit(onsubmit)}
        >
          <div className='mb-3'>
            <p className='mb-2 font-medium'>Nome do artista</p>
            <Input
              type='text'
              register={register}
              name='name'
              error={errors.name?.message}
              placeholder='Ex: Alex ...'
            />
          </div>

          <div className='flex w-full mb-3 flex-row items-center gap-4'>
            <div className='w-full'>
              <p className='mb-2 font-medium'>Telefone / whatsapp</p>
              <Input
                type='text'
                register={register}
                name='whatsapp'
                error={errors.whatsapp?.message}
                placeholder='Ex: 00 000000000'
              />
            </div>

            <div className='w-full'>
              <p className='mb-2 font-medium'>Cidade</p>
              <Input
                type='text'
                register={register}
                name='city'
                error={errors.city?.message}
                placeholder='Ex: Equador'
              />
            </div>
          </div>
          
          <div className='flex w-full mb-3 flex-row items-center gap-4'>
            <div className='w-full'>
              <p className='mb-2 font-medium'>Preço</p>
              <Input
                type='text'
                register={register}
                name='price'
                error={errors.price?.message}
                placeholder='Ex: 55.000...'
              />
            </div>

            <div className='w-full'>
              <p className='mb-2 font-medium'>Categoria</p>
              <Input
                type='text'
                register={register}
                name='category'
                error={errors.category?.message}
                placeholder='Ex: Pinturas, escultura'
              />
            </div>
          </div>

          <div className='mb-3'>
            <p className='mb-2 font-medium'>Descrição</p>
            <textarea
              className='border-2 w-full rounded-md h-24 px-2'
              {...register("description")}
              name="description"
              id="description"
              placeholder='Digite a descrição completa sobre sua arte...'
            />
            {errors.description && <p className='mb-1 text-yellow-900'>{errors.description.message}</p>}
          </div>

          <button type='submit' className='w-full rounded-md bg-zinc-900 text-white font-medium h-10'>
            Cadastrar
          </button>
          
        </form>
      </div>
    </Container>
  )
}
  