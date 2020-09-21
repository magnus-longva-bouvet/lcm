import React, {useEffect, useState} from 'react'
import styled from 'styled-components'
import {Radio, TextField, Typography} from '@equinor/eds-core-react'
import BridgeGraph from "./BridgeGraph.js"
import {OptimizerAPI} from "../../Api"

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: min-width;
  padding: 0px;
  padding-bottom: 2rem;
  grid-gap: 2rem;
  position: relative;
  transition: all 0.36s;
  grid-template-columns: repeat(1, fit-content(100%));
`

const WrapperHeader = styled.div`
  padding-bottom: 2rem;
`

const UnstyledList = styled.ul`
  margin: 0;
  padding: 0;
  list-style-type: none;
`

const Grid = styled.div`
  height: auto;
  width: 100%;
  padding: 32px;
  box-sizing: border-box;
  display: flex;
  grid-gap: 0px 100px;
`


export default ({combinationMap, isLoadingMix, mode, setMode, value, setValue}) => {
    const [sizeFractions, setSizeFractions] = useState([])
    const [fetchedSizeFractions, setFetchedSizeFractions] = useState([])
    const [bridge, setBridge] = useState(null)
    const [loadingSizeFractions, setLoadingSizeFractions] = useState(false)
    const [unit, setUnit] = useState('mD')

    const [bridgeValue, setBridgeValue] = useState(-1)
    const [bridgeMode, setBridgeMode] = useState(null)
    const [loadingBridge, setLoadingBridge] = useState(false)
    const [fetchedBridge, setFetchedBridge] = useState(false)

    function onChange(event) {
        switch (event.target.value) {
            case 'PERMEABILITY':
                setMode('PERMEABILITY')
                setUnit('mD')
                break
            case 'AVERAGE_PORESIZE':
                setMode('AVERAGE_PORESIZE')
                setUnit('microns')
                break

            case 'MAXIMUM_PORESIZE':
                setMode('MAXIMUM_PORESIZE')
                setUnit('micorns')
                break
            default:
                return
        }
        // Need to be smarter on when to getBridge
        // this.getBridge(this.state.value, event.target.value)
    }

    function onNewValue(event) {
        var value = event.target.value
        //alert("New value: " + value)
        if (!value || isNaN(value)) {
            setValue(0)
        } else {
            setValue(value)
        }
        getBridge((isNaN(value)) ? 0 : event.target.value, mode)
    }

    function getBridge(value, mode) {
        setLoadingBridge(true)
        setFetchedBridge(false)
        if (value !== 0) {

            OptimizerAPI.postOptimizerApi({
                "request": "BRIDGE",
                "option": mode,
                "value": parseInt(value),
            })
                .then(response => {
                    return response.json()
                })

                .then(responseData => {
                    console.log(responseData)
                    return responseData
                })
                .then(data => {
                    // Check if returned request is outdated
                    if (value !== value) {
                        setLoadingBridge(false)
                        setFetchedBridge(true)
                    } else {
                        setBridgeValue(value)
                        setBridgeMode(mode)
                        setBridge(data.bridge)
                        setLoadingBridge(false)
                        setFetchedBridge(true)
                    }
                    return data
                })
                .catch(err => {
                    console.log("fetch erroAAAr" + err)
                    if (value !== value) {
                        setLoadingBridge(false)
                        setFetchedBridge(true)
                    } else {
                        setBridge(null)
                        setLoadingBridge(false)
                        setFetchedBridge(true)
                    }
                })
        } else {
            setBridge(null)
            setBridgeValue(0)
            setLoadingBridge(false)
            setFetchedBridge(true)
        }
    }

    function getSizeFractions() {
        setLoadingSizeFractions(true)
        OptimizerAPI.postOptimizerApi({"request": "SIZE_FRACTIONS"})
            .then(response => {
                return response.data
            })
            .then(responseData => {
                console.log(responseData)
                return responseData
            })
            .then(data => {
                setSizeFractions(data.size_fractions)
                setLoadingSizeFractions(false)
                setFetchedSizeFractions(true)
                return data
            })
            .catch(err => {
                console.log("fetch error" + err)
                setLoadingSizeFractions(false)
                setFetchedSizeFractions(true)
            })
    }

    useEffect(() => {
        getSizeFractions()
    }, [])


    var bridgeAndCombinations = []
    if (bridge) {
        bridgeAndCombinations.push({name: "Bridge", cumulative: bridge})
    }
    combinationMap.forEach((combination, key) => {
        if (combination.hasOwnProperty("cumulative")) {
            bridgeAndCombinations.push({name: combination.name, cumulative: combination.cumulative})
        }
    })

    return (
        <Wrapper>
            <Grid>
                <div>
                    <WrapperHeader>
                        <Typography variant="h2">Bridging options</Typography>
                    </WrapperHeader>
                    <Wrapper>
                        <legend>Bridging based on:</legend>
                        <UnstyledList>
                            <li>
                                <Radio
                                    label="Permeability"
                                    name="group"
                                    value="PERMEABILITY"
                                    onChange={onChange}
                                    checked={(mode === "PERMEABILITY")}
                                />
                            </li>
                            <li>
                                <Radio
                                    label="Average poresize"
                                    name="group"
                                    value="AVERAGE_PORESIZE"
                                    onChange={onChange}
                                    checked={(mode === "AVERAGE_PORESIZE")}
                                />
                            </li>
                            <li>
                                <Radio
                                    label="Maximum poresize"
                                    name="group"
                                    value="MAXIMUM_PORESIZE"
                                    onChange={onChange}
                                    checked={(mode === "MAXIMUM_PORESIZE")}
                                />
                            </li>
                        </UnstyledList>
                        <legend>Enter value:</legend>
                        <TextField
                            type="number"
                            id="textfield-number"
                            meta={unit}
                            value={(value === 0) ? "" : value}
                            onChange={onNewValue}
                        />
                    </Wrapper>
                </div>
                <BridgeGraph key="bridgeGraph"
                             fetchedBridge={fetchedBridge}
                             loadingBridge={loadingBridge}
                             bridgeAndCombinations={bridgeAndCombinations}
                             fetchedSizeFractions={fetchedSizeFractions}
                             sizeFractions={sizeFractions}
                />
            </Grid>
        </Wrapper>
    )
}