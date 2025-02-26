

const { createContext, useContext, useEffect, useState,useMemo } = require("react");
import { loadContract } from "@utils/loadContract";
import detectEthereumProvider from "@metamask/detect-provider"
import Web3 from "web3"
import { setupHooks } from "./hooks/setupHooks";

const Web3Context = createContext(null)

const createWeb3State = ({web3,provider,contract,isLoading}) => {
    return{
        web3,
        provider,
        contract,
        isLoading,
        hooks:setupHooks({web3,provider,contract})
    }
}

export default function Web3Provider({children}){

    const[web3Api, setWeb3Api] = useState(createWeb3State(
        {   web3:null,
            provider:null,
            contract:null,
            isLoading:true
        }
    ))
    
    useEffect(()=>{
        const loadProvider = async () =>{
            const provider = await detectEthereumProvider()
            if(provider){
                const web3 = new Web3(provider)
                const contract = await loadContract("MusicApp",web3)
                

                setWeb3Api(createWeb3State({
                    web3,
                    provider,
                    contract,
                    isLoading:false
                })
                )
            }else{
                setWeb3Api(api=>({...api,isLoading:false}))
                console.error("Please, install Metamask.")
            }
        }

        loadProvider()

    },[])



    const _web3Api = useMemo(()=>{
        const {web3,provider } = web3Api

        return{
            ...web3Api,
            isWeb3Loaded:  web3Api.web3 != null,
            getHooks: () => setupHooks(web3,provider),
            connect: provider ?
            async () => {
                try{
                    await provider.request({method:"eth_requestAccounts"})
                }catch{
                  
                    location.reload()
                }
            } :
            () => console.error("Connect failed")
        }
    },[web3Api])


    return(
        <Web3Context.Provider value={_web3Api}>
        {children}
        </Web3Context.Provider>
    )

    
}

export function useWeb3(){
    return useContext(Web3Context)
}


export function useHooks(cb){
    const {getHooks} = useWeb3()
    return cb(getHooks())
}
