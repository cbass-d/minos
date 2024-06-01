import { useState } from "react";
import "./App.css";
import {
  Box,
  Container,
  FormControl,
  FormHelperText,
  InputLabel,
  Typography,
  Select,
  Stack,
  MenuItem,
  Alert,
  Divider,
  Grid,
  Paper,
  TextField,
  styled,
} from "@mui/material";
import { useForm } from "react-hook-form";

function App() {
  const [askForMaskFormat, setAskForFormat] = useState(false);
  const [validIpAddress, setValidIpAddress] = useState(false);
  const [validMask, setValidMask] = useState(false);
  const [usedBits, setUsedBits] = useState();
  const [oldSubnetBits, setOldSubnetBits] = useState(0);
  const [subnetAddresses, setSubnets] = useState([]);
  const [firstAddresses, setFirst] = useState([]);
  const [lastAddresses, setLast] = useState([]);
  const [networkAddresses, setNetwork] = useState([]);
  const [broadcastAddresses, setBroadcast] = useState([]);

  // Syled components for displaying data in table format
  const HeaderCell = styled("div", {
    name: "HeaderCell",
  })(({ theme }) => ({
    display: "flex",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "black",
    width: "100%",
    height: "5vh",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  }));

  const TableCell = styled("div", {
    name: "HeaderCell",
  })(({ theme }) => ({
    display: "flex",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "black",
    width: "100%",
    height: "5vh",
    alignItems: "center",
    justifyContent: "center",
  }));

  const { register, getValues, setValue, resetField, watch } = useForm();

  // onChange function for maskFormat field
  const updateMaskFormat = (event) => {
    const maskFormat = event.target.value;
    const elem = document.getElementById("networkMask");
    resetField("networkMask");

    if (elem.getAttributeNames().includes("readonly")) {
      elem.removeAttribute("readOnly");
    }

    if (maskFormat === "cidr") {
      elem.setAttribute("placeholder", "ex. /24");
    } 
    else if (maskFormat === "octects") {
      elem.setAttribute("placeholder", "ex. 255.255.255.0");
    }
  };

  const checkForFormat = () => {
    if (getValues("maskFormat") === "") {
      setAskForFormat(true);
    } 
    else {
      setAskForFormat(false);
    }
  };

  const removeAlert = () => {
    setAskForFormat(false);
  };

  const verifyIPAddress = (event) => {
    setValue("ipAddress", event.target.value);

    if (
      RegExp(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/).test(
        getValues("ipAddress")
      )
    ) {
      setValidIpAddress(true);

      // If valid mask is already provided create subnet table
      if (validMask) {
        setUsedBits(calculateUsedBits());
        createSubnets(0);
      }
    } else {
      setValidIpAddress(false);
      resetField("subnetBits");
      resetField("numberOfSubnets");
    }
  };

  const verifyNetworkMask = (event) => {
    setValue("networkMask", event.target.value);

    if (getValues("maskFormat") === "octects") {
      if (
        RegExp(
          /^(255)\.(0|128|192|224|240|248|252|254|255)\.(0|128|192|224|240|248|252|254|255)\.(0|128|192|224|240|248|252|254|255)/gm
        ).test(getValues("networkMask"))
      ) {
        setValidMask(true);
        setUsedBits(calculateUsedBits());

        // If valid IP addres is already provided, create subnet table
        if (validIpAddress) {
          createSubnets(0);
        }
      } else {
        resetField("subnetBits");
        resetField("numberOfSubnets");
        setValidMask(false);
      }
    } else if (getValues("maskFormat") === "cidr") {
      if (RegExp(/^\/(3[0-2]|[12]?[0-9])$/).test(getValues("networkMask"))) {
        setValidMask(true);
        setUsedBits(calculateUsedBits());

        // If valid IP addres is already provided, create subnet table
        if (validIpAddress) {
          createSubnets(0);
        }
      } else {
        resetField("subnetBits");
        resetField("numberOfSubnets");
        setValidMask(false);
      }
    }
  };

  // Get number of network bits from mask
  const calculateUsedBits = () => {
    let tmpUsedBits = 0;

    if (getValues("maskFormat") === "octects") {
      let octects = Array.from(getValues("networkMask").split(/\./));

      for (let i = 0; i < octects.length; i++) {
        if (octects[i] != 0) {
          while (octects[i] > 0) {
            tmpUsedBits += octects[i] % 2;
            octects[i] = octects[i] >> 1;
          }
        } else {
          break;
        }
      }
    } else if (getValues("maskFormat") === "cidr") {
      tmpUsedBits = Number(getValues("networkMask").replace("/", ""));
    }

    return tmpUsedBits;
  };

  // onChange function for "subnetBits" field
  const updateSubnetBits = () => {
    let subnetBits = getValues("subnetBits");

    // Set min and max values
    if (subnetBits < 0) {
      setValue("subnetBits", 0);
      subnetBits = getValues("subnetBits");
    } else if (subnetBits > Number(32) - usedBits) {
      setValue("subnetBits", Number(32) - usedBits);
      subnetBits = getValues("subnetBits");
    }

    updateBitsVisualization(subnetBits, oldSubnetBits);

    // Update number of subnets
    const numberOfSubnets = Math.pow(2, subnetBits);
    setValue("numberOfSubnets", numberOfSubnets);

    setOldSubnetBits(subnetBits);
    createSubnets(subnetBits);
  };
  
  // Change color of subnet bits
  const updateBitsVisualization = (subnetBits, oldSubnetBits) => {

    //Remove
    if (
      Number(subnetBits) < Number(oldSubnetBits) ||
      Number(subnetBits) === 0
    ) {
      let ind = usedBits + Number(oldSubnetBits) - 1;
      let tmpOldVal = Number(oldSubnetBits);

      while (tmpOldVal > subnetBits) {
        document
          .getElementById(`bit_num_${ind}`)
          .style.setProperty("background-color", "");
        document
          .getElementById(`bit_val_${ind}`)
          .style.setProperty("background-color", "");
        tmpOldVal--;
        ind--;
      }
    }

    // Add
    else {
      let ind = usedBits;
      for (let i = subnetBits; i > 0; i--) {
        document
          .getElementById(`bit_num_${ind}`)
          .style.setProperty("background-color", "lightgreen");
        document
          .getElementById(`bit_val_${ind}`)
          .style.setProperty("background-color", "lightgreen");
        ind++;
      }
    }
  };

  // onChange function for "numberOfSubnets" field
  const updateNumberOfSubnets = (event) => {
    
    // Set min and max values
    if (event.target.value < 1) {
      event.target.value = 1;
    } else if (event.target.value > Math.pow(2, 32 - usedBits)) {
      event.target.value = Math.pow(2, 32 - usedBits);
    }

    // Update number of subnets bits
    const subnetBits = Math.ceil(Math.log(event.target.value) / Math.log(2));
    setOldSubnetBits(getValues("subnetBits"));
    setValue("subnetBits", subnetBits);

    updateBitsVisualization(subnetBits, oldSubnetBits);
    createSubnets(subnetBits);
  };

  const ipToBinary = (address) => {
    let binary = "";
    Array.from(address.split(/\./)).map((octect) => {
      binary += Number(octect).toString(2).padStart(8, "0");
    });

    return binary;
  };

  const decimalToIP = (address, mask) => {
    let binary = address.toString(2);

    if (binary.length != 32) {
      binary = binary.padStart(32, "0");
    }

    let octects = Array.from(binary.match(/.{1,8}/g));
    octects.forEach((octect, index) => {
      octects[index] = Number.parseInt(octect, 2);
    });

    let ipAddress = String(octects.join("."));

    // If needed at CIDR subnet notation
    if (mask != -1) {
      ipAddress = ipAddress.concat(`/${mask}`);
    }

    return ipAddress;
  };

  const networkAddress = (subnet) => {
    return Array.from(subnet.split("/"))[0];
  };

  const firstHost = (network) => {
    let binary = ipToBinary(network);

    return decimalToIP(Number.parseInt(binary, 2) + 1, -1);
  };

  const lastHost = (network, numOfHosts) => {
    let binary = ipToBinary(network);

    return decimalToIP(Number.parseInt(binary, 2) + numOfHosts, -1);
  };

  const broadcastAddress = (lastHost) => {
    let binary = ipToBinary(lastHost);

    return decimalToIP(Number.parseInt(binary, 2) + 1, -1);
  };

  const createSubnets = (subnetBits) => {
    
    // At first load of subnet table, value of usedBits set by
    // useState is still not defined
    const localUsedBits = usedBits ? usedBits : calculateUsedBits();

    // Get binary of IP and network mask
    const startingAddress = ipToBinary(getValues("ipAddress"));
    let maskBinary;
    if (getValues("maskFormat") === "octects") {
      maskBinary = ipToBinary(getValues("networkMask"));
    } else if (getValues("maskFormat") === "cidr") {
      maskBinary = "1".repeat(localUsedBits);
      maskBinary = maskBinary.padEnd(32, "0");
    }

    // Get number of host per subnet
    // Used to generate next subnet
    const newSubnetBits = maskBinary.lastIndexOf("1") + Number(subnetBits) + 1;
    const subnetHosts = Math.pow(2, 32 - newSubnetBits) - 2;

    let numberOfSubnets = (getValues("numberOfSubnets")) ? getValues("numberOfSubnets") : 1;
    numberOfSubnets = numberOfSubnets === "0" ? 1 : numberOfSubnets
    if (numberOfSubnets > 2048) {
      numberOfSubnets = 2048;
    }
    
    let subnets = Array.from(Array(numberOfSubnets));
    let first = Array.from(Array(numberOfSubnets));
    let last = Array.from(Array(numberOfSubnets));
    let network = Array.from(Array(numberOfSubnets));
    let broadcast = Array.from(Array(numberOfSubnets));

    // Generate the subnet addresses
    let lastAddress;
    for (let i = 0; i < numberOfSubnets; i++) {
      if (i === 0) {
        const newAddress =
          BigInt("0b" + startingAddress) & BigInt("0b" + maskBinary);
        subnets[i] = decimalToIP(newAddress, newSubnetBits);
        lastAddress = newAddress;
      } else {
        const newAddress = lastAddress + BigInt(subnetHosts + 2);
        subnets[i] = decimalToIP(newAddress, newSubnetBits);
        lastAddress = newAddress;
      }

      // Get other important addresses:
      // * first host
      // * last host
      // * network address
      // * broadcast address
      network[i] = networkAddress(subnets[i]);
      first[i] = firstHost(network[i]);
      last[i] = lastHost(network[i], subnetHosts);
      broadcast[i] = broadcastAddress(last[i]);
    }

    setSubnets(subnets);
    setFirst(first);
    setLast(last);
    setBroadcast(broadcast);
    setNetwork(network);
  };

  return (
    <Container width="100vw">
      <Box>
        <Typography variant="h2">M I N O S</Typography>
        <Divider orientation="horizontal" sx={{ border: 4, color: "black" }} />
        <Typography variant="h3">Mostly-In-One Subnetting</Typography>

        {/* Input for IP, Network Mask, and Mask Format */}
        <Stack direction={"row"} marginTop={10} spacing={15}>
          <FormControl>
            <TextField
              id="ipAddress"
              label="Network Address"
              variant="standard"
              placeholder="ex. 7.7.7.7"
              helperText={"Starting network address of subnet."}
              autoFocus={true}
              inputProps={{ style: { fontSize: 20 } }}
              InputLabelProps={{ style: { fontSize: 22, fontWeight: "bold" } }}
              {...register("ipAddress")}
              onChange={verifyIPAddress}
            />
            {!validIpAddress && (
              <FormHelperText sx={{ color: "red" }}>
                Invalid IP Address.
              </FormHelperText>
            )}
          </FormControl>
          <Stack direction={"row"} spacing={4}>
            <FormControl>
              <TextField
                id="networkMask"
                label="Network Mask"
                variant="standard"
                helperText={"Mask bits for subnet."}
                onMouseEnter={checkForFormat}
                onFocus={checkForFormat}
                onBlurCapture={removeAlert}
                onMouseLeave={removeAlert}
                inputProps={{ style: { fontSize: 20 }, readOnly: true }}
                InputLabelProps={{
                  style: { fontSize: 22, fontWeight: "bold" },
                }}
                {...register("networkMask")}
                onChange={verifyNetworkMask}
              />
              {askForMaskFormat && (
                <Alert severity="info" sx={{ marginTop: 2 }}>
                  Must first choose mask format.
                </Alert>
              )}
              {!validMask && (
                <FormHelperText sx={{ color: "red" }}>
                  Invalid Network Mask.
                </FormHelperText>
              )}
            </FormControl>
            <FormControl>
              <Select
                id="maskFormat"
                variant="standard"
                defaultValue={""}
                sx={{ marginTop: 3 }}
                {...register("maskFormat")}
                onChange={updateMaskFormat}
              >
                <MenuItem value="" disabled>
                  Select Format
                </MenuItem>
                <MenuItem value="cidr">/x</MenuItem>
                <MenuItem value="octects">Octects</MenuItem>
              </Select>
            </FormControl>
            <InputLabel
              sx={{ fontWeight: "bold", fontSize: 20, paddingTop: 3 }}
            >
              Mask Format
            </InputLabel>
          </Stack>
        </Stack>

        {/* Once a valid Address and mask has been provided, display the subnet allocation
        options */}
        {validIpAddress &&
          validMask &&
          getValues("ipAddress") &&
          getValues("networkMask") && (
            <>
              {/* Subnet bits and number inputs */}
              <Stack direction={"row"} spacing={15} marginTop={5}>
                <FormControl>
                  <TextField
                    id="subnetBits"
                    label="Subnet Bits"
                    type="number"
                    variant="standard"
                    helperText={"Number of bits for subnetting"}
                    defaultValue={0}
                    inputProps={{ style: { fontSize: 20 } }}
                    InputLabelProps={{
                      style: { fontSize: 22, fontWeight: "bold" },
                      shrink: true,
                    }}
                    {...register("subnetBits", {
                      onChange: updateSubnetBits,
                    })}
                  />
                </FormControl>
                <FormControl>
                  <TextField
                    id="numberOfSubnets"
                    label="Number of Subnets"
                    type="number"
                    variant="standard"
                    helperText={"Number of subnets to be created"}
                    defaultValue={1}
                    inputProps={{ style: { fontSize: 20 } }}
                    InputLabelProps={{
                      style: { fontSize: 22, fontWeight: "bold" },
                      shrink: true,
                    }}
                    {...register("numberOfSubnets", {
                      onChange: updateNumberOfSubnets,
                    })}
                  />
                </FormControl>
                <Box paddingTop={3}>
                  (Only up-to 2048 subnets are displayed)
                </Box>
              </Stack>

              {/* Table to visualize subnet allocation options */}
              <Paper elevation={8}>
                <Grid
                  container
                  marginTop={5}
                  justifyContent={"flex-start"}
                  alignContent={"flex-start"}
                >
                  {/* IP Address row */}
                  <Grid item xs={2}>
                    <HeaderCell>IP Address</HeaderCell>
                  </Grid>
                  <Grid
                    container
                    item
                    justifyContent={"flex-start"}
                    alignContent={"flex-start"}
                    xs={10}
                  >
                    {Array.from(watch("ipAddress").split(/\./)).map(
                      (octect, index) => {
                        return (
                          <Grid item xs={3} key={index}>
                            <TableCell>{octect}</TableCell>
                          </Grid>
                        );
                      }
                    )}
                  </Grid>

                  {/* Octet Value row */}
                  <Grid item xs={2}>
                    <HeaderCell>Octect Value</HeaderCell>
                  </Grid>
                  <Grid
                    container
                    item
                    justifyContent={"flex-start"}
                    alignContent={"flex-start"}
                    xs={10}
                  >
                    {Array.from(watch("ipAddress").split(/\./)).map(
                      (octect, index) => {
                        return (
                          <Grid item xs={3} key={index}>
                            <TableCell>
                              {Number(octect).toString(16).toUpperCase()}
                            </TableCell>
                          </Grid>
                        );
                      }
                    )}
                  </Grid>

                  {/*Octect Number row */}
                  <Grid item xs={2}>
                    <HeaderCell>Octect Number</HeaderCell>
                  </Grid>
                  <Grid
                    container
                    item
                    justifyContent={"flex-start"}
                    alignContent={"flex-start"}
                    xs={10}
                  >
                    {Array.from(Array(4)).map((_, index) => {
                      return (
                        <Grid item xs={3} key={index}>
                          <TableCell>{index + 1}</TableCell>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {/* Bit Number row */}
                  <Grid item xs={2}>
                    <HeaderCell>Bit Number</HeaderCell>
                  </Grid>
                  <Grid
                    container
                    item
                    justifyContent={"flex-start"}
                    alignContent={"flex-start"}
                    xs={10}
                  >
                    {Array.from(Array(32)).map((_, index) => {
                      return (
                        <Grid
                          item
                          xs={0.375}
                          id={`bit_num_${index}`}
                          key={index}
                          sx={{
                            backgroundColor:
                              usedBits > index ? "lightblue" : "",
                          }}
                        >
                          <TableCell>{index + 1}</TableCell>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {/* Bit Value row */}
                  <Grid item xs={2}>
                    <HeaderCell>Bit Value</HeaderCell>
                  </Grid>
                  <Grid
                    container
                    item
                    justifyContent={"flex-start"}
                    alignContent={"flex-start"}
                    xs={10}
                  >
                    {/* Convert IP to binary and display each bit */}
                    {Array.from(ipToBinary(watch("ipAddress"))).map(
                      (bit, index) => {
                        return (
                          <Grid
                            item
                            xs={0.375}
                            id={`bit_val_${index}`}
                            key={index}
                            sx={{
                              backgroundColor:
                                usedBits > index ? "lightblue" : "",
                            }}
                          >
                            <TableCell>{bit}</TableCell>
                          </Grid>
                        );
                      }
                    )}
                  </Grid>
                </Grid>
              </Paper>

              {/* Subnets table */}
              <Paper elevation={8}>
                <Grid
                  container
                  marginTop={5}
                  justifyContent={"flex-start"}
                  alignContent={"flex-start"}
                  columns={10}
                >
                  <Grid item xs={2}>
                    <HeaderCell>Subnet</HeaderCell>
                    {subnetAddresses.map((subnet, index) => {
                      return (
                        <Grid item key={index}>
                          <TableCell>{subnet}</TableCell>
                        </Grid>
                      );
                    })}
                  </Grid>

                  <Grid item xs={2}>
                    <HeaderCell>Start Address</HeaderCell>
                    {firstAddresses.map((first, index) => {
                      return (
                        <Grid item key={index}>
                          <TableCell>{first}</TableCell>
                        </Grid>
                      );
                    })}
                  </Grid>

                  <Grid item xs={2}>
                    <HeaderCell>End Address</HeaderCell>
                    {lastAddresses.map((last, index) => {
                      return (
                        <Grid item key={index}>
                          <TableCell>{last}</TableCell>
                        </Grid>
                      );
                    })}
                  </Grid>

                  <Grid item xs={2}>
                    <HeaderCell>Network Address</HeaderCell>
                    {networkAddresses.map((network, index) => {
                      return (
                        <Grid item key={index}>
                          <TableCell>{network}</TableCell>
                        </Grid>
                      );
                    })}
                  </Grid>

                  <Grid item xs={2}>
                    <HeaderCell>Broadcast Address</HeaderCell>
                    {broadcastAddresses.map((broadcast, index) => {
                      return (
                        <Grid item key={index}>
                          <TableCell>{broadcast}</TableCell>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Grid>
              </Paper>
            </>
          )}
      </Box>
    </Container>
  );
}

export default App;
