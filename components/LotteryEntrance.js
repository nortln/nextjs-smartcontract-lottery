import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses} from "../constants/index"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { useNotification } from "web3uikit"
import { ethers } from "ethers"

export default function LotteryEntrance() {
    const {chainId: chainIdHex, isWeb3Enabled} = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const [entranceFee, setEntranceFee] = useState("0")
    const [NumPlayers, setNumPlayers] = useState(0)
    const [recentWinner, setRecentWinner] = useState(0)

    const dispatch = useNotification()

    const {runContractFunction: enterRaffle} = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee
    })

    const {runContractFunction: getEntranceFee, isLoading, isFetching} = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })
    const {runContractFunction: getNumberOfPlayers} = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })
    const {runContractFunction: getRecentWinner} = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        setEntranceFee(entranceFeeFromCall)
        const numPlayersFromCall = (await getNumberOfPlayers()).toString()
        setNumPlayers(numPlayersFromCall)
        const recentWinnerFromCall = await getRecentWinner()
        setRecentWinner(recentWinnerFromCall)
     }

    useEffect(() => {
        if(isWeb3Enabled) {
           
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx){
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div className="p-5">
            <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
            onClick={async function () {await enterRaffle(
                {
                    onSuccess: handleSuccess,
                    onError: (error) => console.log(error),
                }
            )}}
                disabled={isLoading || isFetching}
            >
               <div> {isLoading || isFetching ? <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div> : <div>Enter Raffle</div>}
</div>
                               </button>
            Hi from lottery LotteryEntrance!
            { raffleAddress ? <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
            Players: {NumPlayers}
            Recent Winner: {recentWinner}
            </div> : <div>No Raffle Address Detected</div>}
         </div> 
    )
}