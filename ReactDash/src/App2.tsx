import React, { useEffect, useRef, useState } from 'react';
import './App.css';

import { createTheme, CssBaseline, Divider, FormControlLabel, Grid, ListItemButton, ListItemIcon, ListItemText, Paper, Radio, RadioGroup, Stack, styled, Switch, TextField, ThemeProvider } from "@mui/material";
import { NetworkTables, NetworkTablesTopic, NetworkTablesTypeInfos } from 'ntcore-ts-client';
import { CheckBox, Commute, DeveloperBoard, DeveloperBoardOff, DoneAll, Flare, FlashOff, Loop, Memory, Power, PowerOff, QrCode, QrCodeScanner, Refresh, RemoveDone, Settings, SettingsSuggest, SmartToyOutlined, SportsEsportsOutlined, Warning } from '@mui/icons-material';
import { Puff } from 'react-loader-spinner';
import { useNTCore } from './NTCoreContext';

// Number Formatter for Match Time Display
const matchTimeFormatter = new Intl.NumberFormat('en-US', {maximumFractionDigits: 0});

// Dark Mode App
const darkTheme = createTheme({
	palette: {
		mode: 'dark'
	}
});

// Clean Elevated Theme
const Item = styled(Paper)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? ' #1A2027' : ' #ffffff',
	...theme.typography.body2,
	padding: theme.spacing(2),
	textAlign: 'center',
	color: theme.palette.text.secondary
}));

// Column Names for Reef Grid
const columnName = ['L', 'R'];
const columnIndexToName = (column: number) => {
	if (column < 0) {
		return "NONE"
	}
	return columnName[column]
}

// Row Names for Reef Grid
const rowName = ['4', '3', '2', '1'];
const rowIndexToName = (row: number) => {
	if (row < 0) {
		return "NONE"
	}
	return rowName[row]
}

// Generate the Icon for the Reef Selector
const getIcon = (column: number, row: number): React.ReactElement => {
	const name = "L" + rowIndexToName(row) + "-" + columnIndexToName(column);
	const nameElement = <div style={{position: 'relative', top: "10px", fontSize: '20px'}}>{name}</div>;
	
	const coral = <img src="./Coral_1.png" style={{maxHeight: '70px'}} />;
	return <Item id={(row + "-" + column)} sx={{backgroundColor: ' #262b32'}}>{nameElement}{coral}</Item>
}

// Creates an Instance of the NTCore Client for the App
// const NT_CORE = NetworkTables.getInstanceByTeam(3245);

// Prefix
/*
const mainPrefix = NT_CORE.createPrefixTopic("/ReactDash/Main");
mainPrefix.subscribe((value) => {
	console.log('[Test Topic] Got Value: ' + value);
});
*/

// const tabPub = NT_CORE.createTopic<string>('/ReactDash/Main/dpub/tab', NetworkTablesTypeInfos.kString, "Autonomous");

// REEFSCAPE Theme Colors (YAY!)
const COLOR_HEATHER_VIOLET = " #E3467F";
const COLOR_YELLOW_TAN = " #F5E565";
const COLOR_CORAL_BLUE = " #ABD8E7";
const COLOR_TEAL_BLUE = " #0083AE";
const COLOR_BLACK = " #000000";

// Topics Abstract
interface Topics {
	selectedAutoPub?: NetworkTablesTopic<string>;
	raiseElevatorPub?: NetworkTablesTopic<boolean>;
	scoreCoralPub?: NetworkTablesTopic<boolean>;
	intakeTypePub?: NetworkTablesTopic<string>;
	selectedCoralStationLanePub?: NetworkTablesTopic<string>;
	ledSelectionPub?: NetworkTablesTopic<string>;
	zeroGyroPub?: NetworkTablesTopic<boolean>;
	neutralElevatorPub?: NetworkTablesTopic<boolean>;
	zeroElevatorPub?: NetworkTablesTopic<boolean>;
	autoDelayPub?: NetworkTablesTopic<number>;
	selectedReefSidePub?: NetworkTablesTopic<string>;
	selectedReefLevelPub?: NetworkTablesTopic<string>;
}

// Set Class Up
const topics: Topics = {
	selectedAutoPub: undefined,
	scoreCoralPub: undefined,
	raiseElevatorPub: undefined,
	intakeTypePub: undefined,
	selectedCoralStationLanePub: undefined,
	ledSelectionPub: undefined,
	zeroGyroPub: undefined,
	neutralElevatorPub: undefined,
	zeroElevatorPub: undefined,
	autoDelayPub: undefined,
	selectedReefSidePub: undefined,
	selectedReefLevelPub: undefined
};

// App Function (migrated from React.Component)
export default function App() {

	const NT_CORE2 = useNTCore();

	// State Variables -> If you don't know about these, GO DOC DIVING
	const [connected, setConnected] = useState(false);
	const [selectedTab, setSelectedTab] = useState("Autonomous");
	const [driverStation, setDriverStation] = useState(0);
	const [joystick0, setJoystick0] = useState(false);
	const [joystick1, setJoyStick1] = useState(false);
	const [matchTime, setMatchTime] = useState(-1);
	const [alliance, setAlliance] = useState("NONE");
	const [allianceColor, setAllianceColor] = useState("NONE");
	const [selectedAuto, setSelectedAuto] = useState("NONE");
	const [selectedAutoFromRobot, setSelectedAutoFromRobot] = useState("NONE");
	const [autoOptions, setAutoOptions] = useState([""]);
	const [intakeType, setIntakeType] = useState("MANUAL");
	const [raiseElevator, setRaiseElevator] = useState(false);
	const [raiseElevatorToggle, setElevatorRaiseToggle] = useState(false);
	const [scoreCoral, setScoreCoral] = useState(false);
	const [coralStationLane, setCoralStationLane] = useState("CENTER");
	const [ledSelection, setLedSelection] = useState("NONE");
	const [zeroGyro, setZeroGyro] = useState(false);
	const [neutralElevator, setNeutralElevator] = useState(false);
	const [zeroElevator, setZeroElevator] = useState(false);
	const [autoDelay, setAutoDelay] = useState(0);
	const [autoDelayFromRobot, setAutoDelayFromRobot] = useState(0);
	const [isRobotAligned, setIsRobotAligned] = useState(false);
	const [isGyroReset, setIsGyroReset] = useState(false);
	const [selectedColumnFromRobot, setSelectedColumnFromRobot] = useState(1);
	const [selectedRowFromRobot, setSelectedRowFromRobot] = useState(0);
	const [currentReefSide, setCurrentReefSide] = useState("R");
	const [currentReefLevel, setCurrentReefLevel] = useState("4");
	const [currentReefID, setCurrentReefID] = useState("0-1");

	const selectedTabTopic = useRef<NetworkTablesTopic<string>>(NT_CORE2.createTopic<string>('/ReactDash/Main/dpub/tab', NetworkTablesTypeInfos.kString, "Autonomous"));

	// Functions for handling state stuff
	function handleConnection(connected: boolean) {
		setConnected(() => connected);
	}

	function handleTabClick(tab: string) {
		console.log("handleTabClick: " + tab)
		setSelectedTab(() => tab);
		
		selectedTabTopic.current.setValue(tab);
	}

	function initTab(tab: string | null) {
		console.log("initTab: " + tab);
		setSelectedTab(() => tab ?? "Autonomous");
	}

	function robotSendTab(tab: string | null) {
		console.log("robotSendTab: " + tab);
		setSelectedTab(() => tab ?? "Autonomous");
	}

	function handleDriverStationChangeFromRobot(location: number | null) {
		setDriverStation(() => location ?? 0);
	}

	function handleJoystickStatusUpdateFromRobot(connected: boolean | null, index: number) {
		console.log("handleJoystickStatusUpdateFromRobot: " + connected + "-" + index);
		connected = connected ?? false;
		switch (index) {
			case 0:
				setJoystick0(() => connected);
				break;
			case 1:
				setJoyStick1(() => connected);
				break;
			default:
				break;
		}
	}

	function handleMatchTime(matchTime: number | null) {
		setMatchTime(() => matchTime ?? -1);
	}

	function handleAlliance(alliance: string | null) {
		console.log("[Alliance]: " + alliance)
		setAlliance(() => alliance ?? "No");

		switch(alliance) {
      case "Blue":
        setAllianceColor(() => ' #1565c0');
        break;
      case "Red":
				setAllianceColor(() => ' #ff1744');
        break;
      default:
				setAllianceColor(() => ' #808080');
				break;
    }
	}

	function handleOptionsChange(options: string[] | null) {
		setAutoOptions(() => options ?? [""]);
	}

	function handleRadioChange(event: React.ChangeEvent<HTMLInputElement>) {
		const value = (event.target as HTMLInputElement).value;
		console.log("handleRadioChange: " + value);
		setSelectedAuto(() => value);

		topics.selectedAutoPub?.setValue(value);
	}

	function enableElevatorUpAnimation() {
		const animatedElements : HTMLCollectionOf<SVGAnimateElement> = window.document.getElementsByTagName("animate");
    for (const index in animatedElements) {
      animatedElements.item(Number(index))?.beginElement();
    }
	}

	function disableElevatorUpAnimation() {
		const animatedElements : HTMLCollectionOf<SVGAnimateElement> = window.document.getElementsByTagName("animate");
    for (const index in animatedElements) {
      animatedElements.item(Number(index))?.endElement();
    }
	}

	function handleRaiseElevator(enabled: boolean) {
		enabled ? enableElevatorUpAnimation() : disableElevatorUpAnimation();
		setRaiseElevator(() => enabled);

		topics.raiseElevatorPub?.setValue(enabled);
	}

	function handleScoreCoral(enabled: boolean) {
		enabled ? <DoneAll style={{fontSize: 80}}/> : <RemoveDone style={{fontSize: 80}}/>;
		setScoreCoral(() => enabled);

		topics.scoreCoralPub?.setValue(enabled);
	}

	function handleSelectedAutoFromRobot(selected: string | null) {
		console.log("setSelectedAutoFromRobot: " + selected);
		const auto = selected ?? "None Selected...";
		setSelectedAuto(() => auto);
		setSelectedAutoFromRobot(() => auto);
	}

	function handleReefSelection(row: number, column: number) {
		const id = row + "-" + column
    const currentSelectedButton = window.document.getElementById(id);
    if (currentSelectedButton != null) {
			currentSelectedButton.style.backgroundColor = COLOR_HEATHER_VIOLET;
		}
    const previouslySelectedButton = window.document.getElementById(currentReefID)
    if (previouslySelectedButton != null && previouslySelectedButton.id != id) {
      window.document.getElementById(currentReefID)!.style.backgroundColor = " #262b32";
    }

		setCurrentReefSide(() => columnIndexToName(column));
		setCurrentReefLevel(() => rowIndexToName(row));
    setCurrentReefID(() => id);

		topics.selectedReefSidePub?.setValue(columnIndexToName(column));
    topics.selectedReefLevelPub?.setValue(rowIndexToName(row));
	}

	function handleCoralStationSelection(type: string) {
    const currentSelectedButton = window.document.getElementById(type);
    if (currentSelectedButton != null) currentSelectedButton.style.backgroundColor = " #43a5ff";
    const previouslySelectedButton = window.document.getElementById(coralStationLane)
    if (previouslySelectedButton != null && previouslySelectedButton.id != type) {
      window.document.getElementById(coralStationLane)!.style.backgroundColor = " #262b32";
    }
    setCoralStationLane(() => type);

		topics.selectedCoralStationLanePub?.setValue(type);
  }

  function handleIntakeSelection(type: string) {
    const currentSelectedButton = window.document.getElementById(type);
    if (currentSelectedButton != null) currentSelectedButton.style.backgroundColor = " #43a5ff";
    const previouslySelectedButton = window.document.getElementById(intakeType)
    if (previouslySelectedButton != null && previouslySelectedButton.id != type) {
      window.document.getElementById(intakeType)!.style.backgroundColor = " #262b32";
    }
    setIntakeType(() => type);

		topics.intakeTypePub?.setValue(type);
  }

  function handleLedSelectionFromRobot(type: string) {
    setLedSelection(() => type);
  }

  function handleLedSelection(type: string) {
    const deselectedButton : boolean = type === ledSelection;
    const newType : string = deselectedButton ? "NONE" : type;
    setLedSelection(() => type);

    topics.ledSelectionPub?.setValue(newType);
  }

  function handleZeroGyro(reset: boolean) {
    setZeroGyro(() => reset);

		topics.zeroGyroPub?.setValue(reset);
  }

  function handleNeutralElevator(neutralize: boolean) {
    setNeutralElevator(() => neutralize);

		topics.neutralElevatorPub?.setValue(neutralize);
  }
  
  function handleZeroElevator(zero: boolean) {
    setZeroElevator(() => zero);

		topics.zeroElevatorPub?.setValue(zero)
  }

  function handleAutoDelayChange(delay: number) {
    console.log("Delay: " + delay)
    setAutoDelay(() => delay);

		topics.autoDelayPub?.setValue(delay);
  }

	function resetDashboard() {
		console.log("resetDashboard triggered");
		window.location.reload();
	}

	// This code handles the connect/disconnect stuff
	// aka componentDidMount() and componentWillUnmount()
	useEffect(() => {

		// Since it can be null
		if (!NT_CORE2) return;

		// Listen for robot connection; Diagnostics go to console
		NT_CORE2.addRobotConnectionListener((e) => setConnected(e), true);

		// Subscribe Topics here...
		const tabTopic = NT_CORE2.createTopic<string>('/ReactDash/Main/rpub/goTotab', NetworkTablesTypeInfos.kString);
		const tabSubUID = tabTopic.subscribe((value: string | null) => { robotSendTab(value); });

		const driverStationTopic = NT_CORE2.createTopic<number>('/ReactDash/Main/rpub/driverStation', NetworkTablesTypeInfos.kInteger);
		const driverStationSubUID = driverStationTopic.subscribe((value: number | null) => { handleDriverStationChangeFromRobot(value); });

		const joystick0Topic = NT_CORE2.createTopic<boolean>('/ReactDash/Main/rpub/joystick0', NetworkTablesTypeInfos.kBoolean);
		const joystick0SubUID = joystick0Topic.subscribe((value: boolean | null) => { handleJoystickStatusUpdateFromRobot(value, 0); });

		const joystick1Topic = NT_CORE2.createTopic<boolean>('/ReactDash/Main/rpub/joystick1', NetworkTablesTypeInfos.kBoolean);
		const joystick1SubUID = joystick1Topic.subscribe((value: boolean | null) => { handleJoystickStatusUpdateFromRobot(value, 1); });

		const matchTimeTopic = NT_CORE2.createTopic<number>('/ReactDash/Main/rpub/matchTime', NetworkTablesTypeInfos.kDouble);
		const matchTimeSubUID = matchTimeTopic.subscribe((value: number | null) => { handleMatchTime(value); });

		const allianceTopic = NT_CORE2.createTopic<string>('/ReactDash/Main/rpub/alliance', NetworkTablesTypeInfos.kString);
		const allianceSubUID = allianceTopic.subscribe((value: string | null) => { handleAlliance(value); });

		// Publish Topics Here...
		selectedTabTopic.current = NT_CORE2.createTopic<string>('/ReactDash/Main/dpub/tab', NetworkTablesTypeInfos.kString, "Autonomous");
		selectedTabTopic.current.publish();
		console.log("[selectedTabTopic] published?: " + selectedTabTopic.current.publisher);
		
		return () => {

			// Unsubscribe from everything here
			console.log("Cleaning up...");
			
			tabTopic.unsubscribe(tabSubUID);
			driverStationTopic.unsubscribe(driverStationSubUID);
			joystick0Topic.unsubscribe(joystick0SubUID);
			joystick1Topic.unsubscribe(joystick1SubUID);
			matchTimeTopic.unsubscribe(matchTimeSubUID);
			allianceTopic.unsubscribe(allianceSubUID);

			selectedTabTopic.current.unpublish();
		};

	// [TODO: Check Dependencies]
	}, [NT_CORE2]);

	// Actual App Stuff
	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<Grid container component="main" sx={{ height: '100vh', paddingRight: darkTheme.spacing(2), paddingTop: darkTheme.spacing(2) }} columns={{ xs: 12, sm: 12, md: 12 }} spacing={2}>
				<Grid size={2}>
					<ListItemButton selected={selectedTab == "Autonomous"} onClick={() => handleTabClick("Autonomous")}>
						<ListItemIcon>
							<SmartToyOutlined />
						</ListItemIcon>
						<ListItemText primary="Autonomous" />
					</ListItemButton>
					<Divider sx={{ my: 1 }} />
					<ListItemButton selected={selectedTab == "Teleop"} onClick={() => handleTabClick("Teleop")}>
						<ListItemIcon>
							<SportsEsportsOutlined />
						</ListItemIcon>
						<ListItemText primary="Teleop" />
					</ListItemButton>
					<Divider sx={{ my: 1 }} />
					<ListItemButton onClick={() => resetDashboard()}>
						<ListItemIcon>
							<Refresh />
						</ListItemIcon>
						<ListItemText primary="Refresh" />
					</ListItemButton>
				</Grid>
				<Grid size={10}>
					<Grid container columns={{ xs: 9, sm: 9, md: 9 }} spacing={2}>
						<Grid size={9}>
							<Stack direction="row" alignItems="stretch" justifyContent="space-evenly" spacing={2}>
								<Item sx={{width: '100%', fontSize: '2rem', backgroundColor: allianceColor}}>
									{alliance} Alliance
								</Item>
								<Item sx={{width: '100%', fontSize: '2rem'}}>
										Driver Station {driverStation}
								</Item>
								<Item sx={{padding: '0px', width: '100%'}}>
									<SportsEsportsOutlined sx={{fontSize: '5rem', color: joystick0 ? COLOR_CORAL_BLUE : COLOR_YELLOW_TAN}} />
									<SportsEsportsOutlined sx={{fontSize: '5rem', color: joystick1 ? COLOR_CORAL_BLUE : COLOR_YELLOW_TAN}} />
								</Item>
								<Item>{connected ? <Power sx={{fontSize: '3rem', color: COLOR_CORAL_BLUE}} /> : <PowerOff sx={{fontSize: '3rem', color: COLOR_YELLOW_TAN}} />}</Item>
								<Item sx={{fontSize: '3rem', width: '100%', padding: darkTheme.spacing(1)}}>
									{connected ? matchTimeFormatter.format(matchTime) : (<span style={{color: COLOR_YELLOW_TAN}}>No Match</span>)}
								</Item>
							</Stack>
						</Grid>

						{/* AUTONOMOUS BOX */}

						{selectedTab == "Autonomous" &&
							<React.Fragment>
								<Grid size={5}>
									<RadioGroup
										value={selectedAuto}
										onChange={handleRadioChange}
									>
										{autoOptions.map((option) => (
											<FormControlLabel value={option} control={<Radio />} label={option} componentsProps={{typography: {fontSize: '1.3rem'}}} key={option} />
										))}
									</RadioGroup>
								</Grid>
								<Grid size={4}>
									<TextField
										fullWidth
										disabled
										label="Dashboard Selected Autonomous"
										value={selectedAuto}
										sx={{marginBottom: darkTheme.spacing(2)}}
										InputProps={{sx:{fontSize: '2rem'}}}
									/>
									{selectedAuto === selectedAutoFromRobot
										? <CheckBox sx={{fontSize: 50, color: COLOR_CORAL_BLUE}} />
										: <Warning sx={{fontSize: 50, color: COLOR_YELLOW_TAN}} />
									}
									<TextField
										fullWidth
										disabled
										label="Robot Selected Autonomous"
										value={selectedAutoFromRobot}
										sx={{marginTop: darkTheme.spacing(2)}}
										InputProps={{sx:{fontSize: '2rem'}}}
									/>
									<Stack direction={"row"} spacing={2} alignItems={"center"} marginTop={4}>
										<TextField
											fullWidth
											label="Auto Delay (Seconds)"
											defaultValue={0}
											InputProps={{sx:{fontSize: '2rem'}}}
											onChange={(e) => handleAutoDelayChange(Number(e.currentTarget.value))}/>
										{autoDelay === autoDelayFromRobot
											? <CheckBox sx={{fontSize: 50, color: COLOR_CORAL_BLUE}} />
											: <Warning sx={{fontSize: 50, color: COLOR_YELLOW_TAN}} />
										}
									</Stack>
								</Grid>
							</React.Fragment>
						}

						{/* TELEOP BOX */}

						{selectedTab == "Teleop" &&
							<React.Fragment>
								<Grid container spacing={2} columns={4}>
									<Grid>
										<Stack direction={'column'} marginTop={2} marginLeft={2} >
											<Stack direction={'row'} gap={2}>
								
												<Stack>
													<p style={{marginBottom: 0, fontSize: "20px"}}>In Position</p>
													<Stack direction={'row'} marginTop={2} marginLeft={1}>
														{isRobotAligned ? <QrCodeScanner style={{fontSize: 80, color: COLOR_CORAL_BLUE}}/> : <QrCode style={{fontSize: 80, color: COLOR_YELLOW_TAN}}/>}
													</Stack>
												</Stack>
												<Stack>
													<p style={{marginBottom: 0, marginLeft: 9, fontSize: "20px"}}>Gyro Yaw</p>
													<Stack direction={'row'} marginTop={2} marginLeft={2}>
														{isRobotAligned ? <DeveloperBoard style={{fontSize: 80, color: COLOR_CORAL_BLUE}}/> : <DeveloperBoardOff style={{fontSize: 80, color: COLOR_YELLOW_TAN}}/>}
													</Stack>
												</Stack>
												<Stack>
													<p style={{marginBottom: 0, marginLeft: 15, fontSize: "20px"}}>Score</p>
													<Stack marginTop={2} marginLeft={2}>
														<Item 
															style={{backgroundColor: scoreCoral ? "#43a5ff" : "#262b32"}}
															// Touch screen
															onTouchStart={() => handleScoreCoral(!scoreCoral)} 
															onTouchEnd={() => handleScoreCoral(!scoreCoral)} 
															// Laptop
															onMouseDown={() => handleScoreCoral(!scoreCoral)} 
															onMouseUp={() => handleScoreCoral(!scoreCoral)} 
														>
															{scoreCoral ? <DoneAll style={{fontSize: 80}}/> : <RemoveDone style={{fontSize: 80}}/>}
														</Item>
													</Stack>
												</Stack>
											</Stack>
											<Stack>
												<Stack marginTop={2} marginLeft={0}>
													<p style={{marginBottom: 0, fontSize: "20px"}}>Reef Selection</p>    
												</Stack>
												<React.Fragment>

												{/* GRID */}

												<Stack height={'80'} direction={'row'} spacing={2} marginTop={0} marginLeft={-2} width={350}>
												<Grid container direction='row' columns={{xs: 1, sm: 1, md: 1}} spacing={2}>
												{Array.from(Array(4)).map((_, row) => (
													<React.Fragment key={row}>
													{Array.from(Array(2)).map((_, column) => (
														<Grid size={0.5} key={(row + "-" + column)}> 
															{getIcon(column, row)} 
														</Grid>
													))}
													</React.Fragment>
												))}

												
												</Grid>
												</Stack>

							</React.Fragment>
											</Stack>
										</Stack>
									</Grid>
									<Grid>
									
									</Grid>
									<Grid width={400}>
										<Stack marginTop={2} marginLeft={1}>
											<p style={{marginBottom: 0, fontSize: "20px"}}>Intake Mode</p>    
										</Stack>              
										<Stack height={'100'} direction={'row'} spacing={2} marginTop={2} marginLeft={2} width={"100%"}>
											<Stack>
												<Item id="MANUAL" style={{backgroundColor: "#43a5ff"}} onClick={() => handleIntakeSelection("MANUAL")}><p>MANUAL</p><Settings style={{fontSize: 80}}/></Item>
											</Stack>
											<Stack>
												<Item id="AUTO" onClick={() => handleIntakeSelection("AUTO")}><p>AUTO</p><SettingsSuggest style={{fontSize: 80}}/></Item>
											</Stack>
										</Stack>
										<Stack marginTop={2} marginLeft={2}>
											<p style={{marginBottom: 0, fontSize: "20px"}}>Coral Station Lane Selection</p>
										</Stack>
										<Stack width={'100%'} direction="column" spacing={2} marginTop={2} marginLeft={2}>
											<Stack direction="row" spacing={2}>
												<Item id="LEFT" onClick={() => handleCoralStationSelection("LEFT")}>Left Lane</Item>
												<Item id="CENTER" style={{backgroundColor: "#43a5ff"}} onClick={() => handleCoralStationSelection("CENTER")}>Center Lane</Item>
												<Item id="RIGHT" onClick={() => handleCoralStationSelection("RIGHT")}>Right Lane</Item>
											</Stack>
											
											<Stack marginTop={2} marginLeft={2}>
												<p style={{marginBottom: 0, fontSize: "20px"}}>Current Reef Selection</p>
											</Stack>
											{/*  <Grid item xs={3} sm={3} md={3}> */}
											<Grid size={3}>
													<Stack direction="row" spacing={2}>
														<Item>
															<TextField
																disabled
																label="Side"
																value={columnIndexToName(selectedColumnFromRobot)}
																// value={columnIndexToName(selectedColumnFromRobot)}
															/>
														</Item>
														<Item>
															<TextField
																disabled
																label="Level"
																value={rowIndexToName(selectedRowFromRobot)}
															/>
														</Item>
													</Stack>
												</Grid>

											<Stack marginTop={2} marginLeft={2}>
												<p style={{marginBottom: 0, fontSize: "20px"}}>Overrides</p>
											</Stack>
											<Stack height={'100'} direction={'row'} spacing={2} marginTop={2} marginLeft={2} width={"100%"}>
												<Stack>
													<Item 
															style={{backgroundColor: zeroGyro ? "#43a5ff" : "#262b32"}}
															// Touch 
															//* this.handleResetGyro(!resetGyro) */
															onTouchStart={() => handleZeroGyro(!zeroGyro)}
															onTouchEnd={() => handleZeroGyro(!zeroGyro)} 
															// Laptop
															onMouseDown={() => handleZeroGyro(!zeroGyro)} 
															onMouseUp={() => handleZeroGyro(!zeroGyro)} 
													><p>Reset Gyro</p><Memory style={{fontSize: 80}}/>
													</Item>
												</Stack>
												<Stack>
													<Item 
															style={{backgroundColor: neutralElevator ? "#43a5ff" : "#262b32"}}
															// Touch screen
															onTouchStart={() => handleNeutralElevator(!neutralElevator)}
															onTouchEnd={() => handleNeutralElevator(!neutralElevator)} 
															// Laptop
															onMouseDown={() => handleNeutralElevator(!neutralElevator)} 
															onMouseUp={() => handleNeutralElevator(!neutralElevator)} 
													><p>Neutral Elev.</p><FlashOff style={{fontSize: 80}}/>
													</Item>
												</Stack>
												<Stack>
													<Item 
															style={{backgroundColor: zeroElevator ? "#43a5ff" : "#262b32"}}
															// Touch screen
															onTouchStart={() => handleZeroElevator(!zeroElevator)}
															onTouchEnd={() => handleZeroElevator(!zeroElevator)} 
															// Laptop
															onMouseDown={() => handleZeroElevator(!zeroElevator)} 
															onMouseUp={() => handleZeroElevator(!zeroElevator)} 
													><p>Zero Elev.</p><Loop style={{fontSize: 80}}/>
													</Item>
												</Stack>
											</Stack>
										</Stack>
										
									</Grid>
									
									<Grid>
										<Stack>
											<Stack marginTop={2} marginLeft={2}>
												<p style={{marginBottom: 0, fontSize: "20px"}}>LED Statuses</p>
											</Stack>             
											<Stack height={'100'} direction={'row'} spacing={2} marginTop={2} marginLeft={2} width={"100%"}>
												<Item style={{backgroundColor: ledSelection === "MANUAL_SIGNAL" ? "#43a5ff" : "#262b32"}} onClick={() => handleLedSelection("MANUAL_SIGNAL")}>
													<p>MANUAL</p>                        
													<Flare style={{fontSize: 80}}/>
												</Item>
												<Item style={{backgroundColor: ledSelection === "PARK_SIGNAL" ? "#43a5ff" : "#262b32"}} onClick={() => handleLedSelection("PARK_SIGNAL")}>
													<p>PARK</p>
													<Commute style={{fontSize: 80}}/>
												</Item>
											</Stack>
										</Stack>
										<Stack position={"relative"} marginLeft={2} marginTop={2} spacing={2}>
											<Stack>
												<p style={{marginBottom: 0, fontSize: "20px"}}>Elevator Up</p>  
											</Stack>
											<Stack style={{transform: 'translate(-50%, -50%)'}} position="absolute" top="50%" left="50%" height={'100'} direction={'column'} alignItems={'center'} marginTop={2} spacing={4}>
													<Switch onChange={(e) => {
														handleRaiseElevator(e.target.checked);
													}}/>
													<Item 
														style={{backgroundColor: raiseElevator ? "#43a5ff" : "#262b32"}} 
														// Touch screen
														onTouchStart={() => !raiseElevatorToggle ? handleRaiseElevator(true): null} 
														onTouchEnd={() => !raiseElevatorToggle ? handleRaiseElevator(false) : null} 
														// Laptop
														onMouseDown={() => !raiseElevatorToggle ? handleRaiseElevator(true): null} 
														onMouseUp={() => !raiseElevatorToggle? handleRaiseElevator(false) : null} 
													>
														<p style={{margin: 0}}>Temporary Raise</p>
													</Item>
											</Stack>
											
											{raiseElevator ? <Puff
												height="300"
												width="300"
												color={COLOR_YELLOW_TAN}
												ariaLabel="audio-loading"
												wrapperStyle={{}}
												wrapperClass="wrapper-class"
												visible={true}
												/> : <div style={{border: "12px solid #bec0c2", height: 300, width: 300, borderRadius: 150}}></div>}
			
										</Stack>
									</Grid>
								</Grid>
							</React.Fragment>
						}
					</Grid>
				</Grid>
			</Grid>
		</ThemeProvider>
	);
} 