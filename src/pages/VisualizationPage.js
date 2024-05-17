import React from 'react'
import { useState, useEffect } from "react";
import '../App.css';

import Container from "@mui/material/Container";
import Typography from '@mui/material/Typography';
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

import SankeySlider from "../SankeySlider";
import LoadSankeyData from "../LoadSankeyData";
import CallSankey from '../CallSankey';
import ModalPage from '../components/ModalPage/ModalPage';
import CSVDataTable from '../CSVDataTable';
import CreateSubsetPage from '../InfoPage';

import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { Link } from 'react-router-dom';
import '../components/Navbar.css';
import { IconContext } from 'react-icons';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import HelpIcon from '@mui/icons-material/HelpOutline';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import MultipleSelectCheckmarks from '../components/MultipleSelectCheckmarks';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import ShowIcon from '@mui/icons-material/ZoomIn';
import axios from 'axios';
import Papa from "papaparse";

var energy = [];
var vertices = [];

var tableData = <CSVDataTable data={""} />;
var selectedEventLogID;

function SaveFilters() {
  const config = { FirstGroupFilters: localStorage.getItem("group1").split(' & '), SecondGroupFilters: localStorage.getItem("group2").split(' & ')};

  var a = document.createElement("a");
  var file = new Blob([JSON.stringify(config)], {type: 'text/plain'});
  a.href = URL.createObjectURL(file);

  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var time = String(today.getHours()) + ':' + String(today.getMinutes());
  today = dd + '/' + mm + '/' + time;

  a.download = "filters " + today;
  a.click();
}

const uniqueArray = (objects, uniqueBy, keepFirst = true) => {
  return Array.from(
    objects.reduce((map, e) => {
      let key = uniqueBy.map(key => [e[key], typeof e[key]]).flat().join('-')
      if (keepFirst && map.has(key)) return map
      return map.set(key, e)
    }, new Map()).values()
  )
}


function VisualizationPage() {
  const projectName = localStorage.getItem('projectName');
  const [notes, setNotes] = useState(localStorage.getItem('notes'))

  const [sidebar, setSidebar] = useState(false);

  const showSidebar = () => setSidebar(!sidebar);

  const [leftSidebar, setLeftSidebar] = useState(true);

  const showLeftSidebar = () => setLeftSidebar(!leftSidebar);

  const [completeData, loadData] = useState([]);

  const [filteredData, filterData] = useState([]);
  
  const [minMax, setMinMax] = useState([]);
  
  const [value1, setValue1] = useState([]);

  const [minMaxNode, setMinMaxNode] = useState([]);

  const [nodes, setNodes] = useState([]);
  
  const [value1Node, setValue1Node] = useState([]);

  const [modalPageActive, setModalPageActive] = useState(false);
  
  const [modalPageActive2, setModalPageActive2] = useState(false);

  const [isChecked, setIsChecked] = useState(() =>
    [true, false]
  );

  const [eventLogs, setEventLogs] = useState(localStorage.getItem('eventlogs') ? JSON.parse(localStorage.getItem("eventlogs")) : []);
  const [verticesOrder, setVerticesOrder] = useState(localStorage.getItem('vertices') ? JSON.parse(localStorage.getItem("vertices")) : []);
  const [activeEventLog, setActiveEventLog] = useState([]);
  const [subsets, setSubsets] = useState([]);

    const isCheckboxChecked = (index, checked) => {
      setIsChecked((isChecked) => {
        return isChecked.map((c, i) => {
          if (i === index) return checked;
          return c;
        });
      });
    };

    const fileInput = React.useRef();

    function handleChange(event) {
      event.preventDefault();
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;

        try {
          localStorage.setItem('group1', JSON.parse(text)['FirstGroupFilters'].join(' & '));
          localStorage.setItem('group2', JSON.parse(text)['SecondGroupFilters'].join(' & '));
        } catch (e) {
          alert("Неверный формат агруженного файла!")
        }
      };
      reader.readAsText(event.target.files[0]);
    }

    function createSubset() {
      if (localStorage.getItem('students').length > 0 || localStorage.getItem('lectors').length > 0 || localStorage.getItem('groups').length > 0 ||
          localStorage.getItem('group1').length > 0 || localStorage.getItem('group2').length > 0) {
        
          var subsetName = prompt('Введите название подмножества:', '');

          if (subsetName !== null) {
            if (subsetName.length > 0) {
              var result = window.confirm(`Для формирования подмножества будут применены следующие фильтры:\n
              Студенты:\n ${localStorage.getItem('students').length === 0 ? '-' : localStorage.getItem('students')} \n
              Преподаватели:\n ${localStorage.getItem('lectors').length === 0 ? '-' : localStorage.getItem('lectors')} \n
              Группа обучения:\n ${localStorage.getItem('groups').length === 0 ? '-' : localStorage.getItem('groups')} \n
              События первой подгруппы:\n ${localStorage.getItem('group1').length === 0 ? '-' : localStorage.getItem('group1').split(' &')} \n
              События второй подгруппы:\n ${localStorage.getItem('group2').length === 0 ? '-' : localStorage.getItem('group2').split(' &')} \n`);

              if (result) {
                var newSubset = {}
                newSubset['id'] = new Date().getTime();
                newSubset['eventlogID'] = activeEventLog.id;
                newSubset['name'] = subsetName;
                newSubset['filters'] = [];
                newSubset['filters']["students"] = localStorage.getItem('students');
                newSubset['filters']["group1"] = localStorage.getItem('group1');
                newSubset['filters']["group2"] = localStorage.getItem('group2');
                newSubset['filters']["groups"] = localStorage.getItem('groups');
                newSubset['filters']["lectors"] = localStorage.getItem('lectors');

                setSubsets([...subsets, newSubset]);
              }
            } else {
              alert('Название подмножества не может быть пустым!');
            }
          } 

      } else {
        alert("Для формирования подмножества необходимо применить к журналу событий, как минимум, один фильтр");
      }
    }

    function getEventLog(event) {
      try {
        Papa.parse(event.target.files[0], {
          download: true,
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            var newEventLog = {}
            newEventLog['id'] = new Date().getTime();
            newEventLog['name'] = event.target.files[0].name;
            newEventLog['data'] = results.data;
            setEventLogs([...eventLogs, newEventLog]);

            if (!localStorage.getItem('eventlogs')) {
              localStorage.setItem('eventlogs', JSON.stringify([newEventLog]))
            } else {
              localStorage.setItem('eventlogs', JSON.stringify([...JSON.parse(localStorage.getItem('eventlogs')), newEventLog]))
            }
        }});
      } catch {
        console.log("Ошибка загрузки файла")
      }
    }

    function parseVertices(event, id) {
      var vertices_ = [];

      try {
        Papa.parse(event.target.files[0], {
          download: true,
          header: false,
          dynamicTyping: true,
          complete: (results) => {
            var columns = results.data.map(function(item){return item;});
            for (let i = 0; i < Object.keys(columns[0]).length - 1; i++) {
              vertices_.push({'source': 'col ' + columns[0][i], 'target': 'col ' + columns[0][i+1], 'value': localStorage.getItem('maxEl'), 'valueLabel': localStorage.getItem('maxEl')});
            }
            for (let i = 1; i < Object.keys(columns).length; i++) {
              for (let j = 0; j < Object.keys(columns[i]).length - 1; j++) {
                vertices_.push({'source': `col${j+1} ` + columns[i][j], 'target': `col${j+2} ` + columns[i][j+1], 'value': localStorage.getItem('maxEl') / 1.5, 'valueLabel': localStorage.getItem('maxEl') / 1.5});
              }
            }

            var newVertices = {}
            newVertices['id'] = id + 'v';
            newVertices['name'] = event.target.files[0].name;
            newVertices['data'] = vertices_;
            newVertices['resultData'] = results;
            setVerticesOrder([...verticesOrder, newVertices]);
            if (!localStorage.getItem('vertices')) {
              localStorage.setItem('vertices', JSON.stringify([newVertices]))
            } else {
              localStorage.setItem('vertices', JSON.stringify([...JSON.parse(localStorage.getItem('vertices')), newVertices]))
            }
          }
        });
      } catch {
        console.log("Ошибка загрузки файла")
      }
    }

    function isEmpty(obj) {
      for(var prop in obj) {
          if(obj.hasOwnProperty(prop))
              return false;
      }
      return true;
    }

    function getFilterData() {
      var data = energy.data.map(object => ({ ...object }))
      var el = [];

      if (!isEmpty(vertices)) {
        vertices.data.forEach(element => {
          el.push(element);
        });
      }

      const selectedStudents = localStorage.getItem('students') === '' ? [] : localStorage.getItem('students').split(',');
      const selectedLectors = localStorage.getItem('lectors') === '' ? [] : localStorage.getItem('lectors').split(',');
      const selectedGroups = localStorage.getItem('groups') === '' ? [] : localStorage.getItem('groups').split(',');

      if (selectedStudents.length > 0 && selectedLectors.length === 0 && selectedGroups.length === 0) {
        Array.prototype.forEach.call(data, element => {
          if (selectedStudents.includes(element.student)) {
            element.source = '1.' + element.source;
            element.target = '1.' + element.target;
          }
        });
      } else if (selectedStudents.length === 0  && selectedLectors.length > 0 && selectedGroups.length === 0) {
        Array.prototype.forEach.call(data, element => {
          if (selectedLectors.includes(element.lector)) {
            element.source = '1.' + element.source;
            element.target = '1.' + element.target;
          }
        });
      } else if (selectedStudents.length === 0  && selectedLectors.length === 0 && selectedGroups.length > 0) {
        Array.prototype.forEach.call(data, element => {
          if (selectedGroups.includes(element.group)) {
            element.source = '1.' + element.source;
            element.target = '1.' + element.target;
          }
        });
      } else if (selectedStudents.length > 0 && selectedLectors.length > 0 && selectedGroups.length === 0) {
        Array.prototype.forEach.call(data, element => {
          if (selectedStudents.includes(element.student) && selectedLectors.includes(element.lector)) {
            element.source = '1.' + element.source;
            element.target = '1.' + element.target;
          }
        });
      } else if (selectedStudents.length > 0 && selectedLectors.length === 0 && selectedGroups.length > 0) {
        Array.prototype.forEach.call(data, element => {
          if (selectedStudents.includes(element.student) && selectedGroups.includes(element.group)) {
            element.source = '1.' + element.source;
            element.target = '1.' + element.target;
          }
        });
      } else if (selectedStudents.length === 0 && selectedLectors.length > 0 && selectedGroups.length > 0) {
        Array.prototype.forEach.call(data, element => {
          if (selectedGroups.includes(element.group) && selectedLectors.includes(element.lector)) {
            element.source = '1.' + element.source;
            element.target = '1.' + element.target;
          }
        });
      } else if (selectedStudents.length > 0 && selectedLectors.length > 0 && selectedGroups.length > 0) {
        Array.prototype.forEach.call(data, element => {
          if (selectedStudents.includes(element.student) && selectedLectors.includes(element.lector) && selectedGroups.includes(element.group)) {
            element.source = '1.' + element.source;
            element.target = '1.' + element.target;
          }
        });
      } else if (localStorage.getItem('group1').length > 0 && localStorage.getItem('group2').length === 0) {
        var group1 = localStorage.getItem('group1');
        var names = [];
        var edges = {};

        Array.prototype.forEach.call(data, element => {
          if (group1.includes(element.target) || group1.includes(element.source)) {
            if (!names.includes(element.student)) {
              names.push(element.student);
              edges[element.student] = [element.target, element.source];
            } else {
              if (!edges[element.student].includes(element.target)) {
                edges[element.student].push(element.target);
              }
              if (!edges[element.student].includes(element.source)) {
                edges[element.student].push(element.source);
              }
            }
          }
        });

        Array.prototype.forEach.call(names, element => {
          var i = 0;
          Array.prototype.forEach.call(group1.split(' & '), element2 => {
            if(edges[element].includes(element2)) {
              i += 1;
            }
          });

          if (i === group1.split(' & ').length - 1) {
            Array.prototype.forEach.call(data, element3 => {
              if (element3.student === element) {
                element3.source = '1.' + element3.source;
                element3.target = '1.' + element3.target;
              }
            });
          }
        });
      } else if (localStorage.getItem('group2').length > 0 && localStorage.getItem('group1').length === 0) {
        var group1 = localStorage.getItem('group2');
        var names = [];
        var edges = {};

        Array.prototype.forEach.call(data, element => {
          if (group1.includes(element.target) || group1.includes(element.source)) {
            if (!names.includes(element.student)) {
              names.push(element.student);
              edges[element.student] = [element.target, element.source];
            } else {
              if (!edges[element.student].includes(element.target)) {
                edges[element.student].push(element.target);
              }
              if (!edges[element.student].includes(element.source)) {
                edges[element.student].push(element.source);
              }
            }
          }
        });

        Array.prototype.forEach.call(names, element => {
          var i = 0;
          Array.prototype.forEach.call(group1.split(' & '), element2 => {
            if(edges[element].includes(element2)) {
              i += 1;
            }
          });

          if (i === group1.split(' & ').length - 1) {
            Array.prototype.forEach.call(data, element3 => {
              if (element3.student === element) {
                element3.source = '2.' + element3.source;
                element3.target = '2.' + element3.target;
              }
            });
          }
        });
      } else if (localStorage.getItem('group2').length > 0 && localStorage.getItem('group1').length > 0) {
        var group1 = localStorage.getItem('group1');
        var group2 = localStorage.getItem('group2');

        var names = [];
        var edges = {};

        var names2 = [];
        var edges2 = {};

        Array.prototype.forEach.call(data, element => {
          if (group1.includes(element.target) || group1.includes(element.source)) {
            if (!names.includes(element.student)) {
              names.push(element.student);
              edges[element.student] = [element.target, element.source];
            } else {
              if (!edges[element.student].includes(element.target)) {
                edges[element.student].push(element.target);
              }
              if (!edges[element.student].includes(element.source)) {
                edges[element.student].push(element.source);
              }
            }
          }

          if (group2.includes(element.target) || group2.includes(element.source)) {
            if (!names2.includes(element.student)) {
              names2.push(element.student);
              edges2[element.student] = [element.target, element.source];
            } else {
              if (!edges2[element.student].includes(element.target)) {
                edges2[element.student].push(element.target);
              }
              if (!edges2[element.student].includes(element.source)) {
                edges2[element.student].push(element.source);
              }
            }
          }
        });

        Array.prototype.forEach.call(names, element => {
          var i = 0;
          Array.prototype.forEach.call(group1.split(' & '), element2 => {
            if(edges[element].includes(element2)) {
              i += 1;
            }
          });

          if (i === group1.split(' & ').length - 1) {
            Array.prototype.forEach.call(data, element3 => {
              if (element3.student === element) {
                element3.source = '1.' + element3.source;
                element3.target = '1.' + element3.target;
              }
            });
          }
        });

        Array.prototype.forEach.call(names2, element => {
          var i = 0;
          Array.prototype.forEach.call(group2.split(' & '), element2 => {
            if(edges2[element].includes(element2)) {
              i += 1;
            }
          });

          if (i === group2.split(' & ').length - 1) {
            Array.prototype.forEach.call(data, element3 => {
              if (element3.student === element) {
                if (element3.source.includes('1.')) {
                  element3.source = '3.' + element3.source.replace('1.', '');
                } else {
                  element3.source = '2.' + element3.source;
                }

                if (element3.target.includes('1.')) {
                  element3.target = '3.' + element3.target.replace('1.', '');
                } else {
                  element3.target = '2.' + element3.target;
                }
              }
            });
          }
        });
      }

      var data2 = data.map(function(item){return {'source': item.source, 'target': item.target};});
      var uniqueData = uniqueArray(data2, ['source', 'target'], true);

      Array.prototype.forEach.call(uniqueData, element => {
        var value = 0;
        Array.prototype.forEach.call(data2, element2 => {
          if (element2.source === element.source && element2.target === element.target) {
            value += 1;
          }
        });
        el.push({'source': element.source, 'target': element.target, 'value': value, 'valueLabel': value})
      });
    
      return el;
    }

    const refresh = () => {
      localStorage.setItem('group1', '');
      localStorage.setItem('group2', '');
      localStorage.setItem('students', []);
      localStorage.setItem('lectors', []);
      localStorage.setItem('groups', []);
      if (energy.length !== 0 && verticesOrder.find(x => x.id === energy.id + 'v')) {
        filterData(getFilterData())
      }
    }
  
    //LoadSankeyData(loadData, filterData, setMinMax, setValue1, setMinMaxNode, setValue1Node, setNodes, energy, vertices);

    useEffect(() => {
      filterData(
        completeData.filter((d) => d.value % 1 !== 0 || (d.value >= value1[0] && d.value <= value1[1]
          && nodes[d.target] >= value1Node[0]
          && nodes[d.target] <= value1Node[1]
          && nodes[d.source] >= value1Node[0]
          && nodes[d.source] <= value1Node[1])),
      );
    }, [value1, value1Node, completeData]);

    function handleMousePos(event) {
      if(event.clientX < 1089){
        if(sidebar) {
          showSidebar()
        }
      }
    }

    document.addEventListener("click", handleMousePos);

  return (
    <div>
        <IconContext.Provider value={{ color: '#fff' }}>
        <div className='navbar'>
          <div container className='home-bars'>
          <Box
          sx={{
            display: "flex",
            flexDirection: "row",
          }}
        >
            <Link to='/projects'>
                <AiIcons.AiFillHome />
            </Link>
            
            <Box
          sx={{
            display: "flex",
            p: 0,
            m: 0,
          }}
        >
          <Typography
            variant="h4"
            color="#FFFFFF"
            fontWeight="bold"
            sx={{ ml: '20px', mb: '20px' }}
          >
            {projectName.length > 69 ? projectName.slice(0, 65) + "..." : projectName}
          </Typography>
          </Box>
          </Box>

            <Link to='#'>
              <AiIcons.AiOutlineDoubleRight color='gainsboro' onClick={showLeftSidebar} />
            </Link>
          </div>

          <Link to='#' id='open' className='menu-bars'>
            <FaIcons.FaBars onClick={showSidebar} />
          </Link>
        </div>
        <div id="nav">
        <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
          <ul className='nav-menu-items' >
            <li className='navbar-toggle'>
              <Link to='#' className='menu-bars'>
                <AiIcons.AiOutlineClose onClick={showSidebar} />
              </Link>
            </li>
            <li className='nav-text' color="white">
              <span> Степень точности визуализации переходов </span>
            </li>
        <Grid container spacing={2} alignItems="center" justify="center">
          <Grid item xs={9}>
            <SankeySlider
              value={value1}
              setValue={setValue1}
              min={0}
              max={minMax[1]}
            />
          </Grid>
        </Grid>
        <li className='nav-text' color="white">
              <span> Степень точности визуализации событий </span>
        </li>
        <Grid container spacing={2} alignItems="center" justify="center">
          <Grid item xs={9}>
            <SankeySlider
              value={value1Node}
              setValue={setValue1Node}
              min={minMaxNode[0]}
              max={minMaxNode[1]}
            />
          </Grid>
        </Grid>
        <Box sx={{ marginTop: 3, marginBottom: 2 }}>
          <Typography variant="h8" color="#fff" p="15px">
              Выбрать студента
          </Typography>
        </Box>
        <MultipleSelectCheckmarks type="students" data={energy.data} />
        <Box sx={{ marginTop: 3, marginBottom: 2 }}>
          <Typography variant="h8" color="#fff" p="15px">
              Выбрать преподавателя
          </Typography>
        </Box>
        <MultipleSelectCheckmarks type="lectors" data={energy.data} />
        <Box sx={{ marginTop: 3, marginBottom: 2 }}>
          <Typography variant="h8" color="#fff" p="15px">
              Выбрать группу
          </Typography>
        </Box>
        <MultipleSelectCheckmarks type="groups" data={energy.data} />

        <Box sx={{ m: 3 }}>
          <Typography variant="h8" color="#fff" p="15px">
              Фильтры первой подгруппы:
          </Typography>
          <Typography variant="h8" color="#fff" p="15px" sx={{ whiteSpace: 'pre-line'}}>
              {localStorage.getItem('group1').split(' & ').join('\n')}
          </Typography>
        </Box>

        <Box sx={{ mt: -3, mb: -2, mr: 4 }} display="flex" justifyContent="flex-end">
          <Button variant="text" onClick={() => {localStorage.setItem('group1', ''); showSidebar(); }}> {localStorage.getItem('group1') !== '' ? 'Сбросить' : ''}</Button>
        </Box>

        <Box sx={{ m: 3 }}>
          <Typography variant="h8" color="#fff" p="15px">
              Фильтры второй подгруппы:
          </Typography>
          <Typography variant="h8" color="#fff" p="15px" sx={{ whiteSpace: 'pre-line'}}>
              {localStorage.getItem('group2').split(' & ').join('\n')}
          </Typography>
        </Box>

        <Box sx={{ mt: -3, mb: 3, mr: 4 }} display="flex" justifyContent="flex-end">
          <Button variant="text" onClick={() => {localStorage.setItem('group2', ''); showSidebar(); }}> {localStorage.getItem('group2') !== '' ? 'Сбросить' : ''}</Button>
        </Box>

        <li className='reload-button' color="white">
          <Link to='#' className='reload-button'>
            <AiIcons.AiOutlineReload onClick={refresh} />
          </Link>

          <Box sx={{ right: 15, position: sidebar ? 'fixed' : '', bottom: 15 }}>
            <Button variant="contained" onClick={() => {
              if (energy.length !== 0 && verticesOrder.find(x => x.id === energy.id + 'v')) {
                filterData(getFilterData());
                showSidebar();
              }}}>Применить</Button>
          </Box>
        </li>
          </ul>
        </nav>
        </div>

        <nav className={leftSidebar ? 'nav-menu-left active' : 'nav-menu-left'}>
          <ul className='nav-menu-items' >
            <li className='navbar-toggle'>
              <Link to='#' className='menu-bars'>
                <AiIcons.AiOutlineClose onClick={showLeftSidebar} />
              </Link>
            </li>
            <Box m={3} pt={2}>

              <TextField
                id="standard-multiline-flexible"
                label="Заметки"
                multiline
                maxRows={5}
                inputProps={{ style: { color: "white" } }}
                variant="standard"
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value); 
                }}
                focused
              />
              <Button variant="text" onClick={() => {
                var formdata = new FormData();

                formdata.append("notes", notes);

                axios.put('http://127.0.0.1:4000/projects/notes/'+localStorage.getItem('projectID'), formdata)
                .then(function (response) {
                })
                .catch(function (error) {
                  alert("Ошибка обновления проекта!");
                });
              }}>Сохранить заметки</Button>
            </Box>

            <Box m={2} pt={2}>
            <Typography variant="h8" style={{ color: '#fff' }}>Журналы событий</Typography>
            <HelpIcon style={{ color: '#fff' }} sx={{mb: -0.6, ml: 1}} onClick={() => {tableData = <CreateSubsetPage />; setModalPageActive2(true);}} />
        <FormGroup>

        <div>
          {eventLogs.map(eventlog => {
            return (
              
              <div key={eventlog.id}>
                <Box
                  component="span"
                  m={1}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                {/* <FormControlLabel control={<Checkbox
                  checked={isChecked[0]}
                  onChange={(e) => {

                  }}
                  sx={{
                    color: "#fff",
                    '&.Mui-checked': {
                      color: "#42aaff",
                    },
                    }}
                    />} label= {<Typography variant="h8" style={{ color: '#fff' }}>{eventlog.name}</Typography>} 
                  /> */}

                <Box display="flex" flexDirection="column" alignItems="left" p={1}>

                <Typography variant="h8" style={{ color: eventlog.id === activeEventLog.id ? "#42aaff" : '#fff', cursor: 'pointer' }} onClick={() => 
                  { setActiveEventLog(eventlog);
                    energy = eventlog;
                    vertices = verticesOrder.filter((row) => row.id === eventlog.id+'v')[0];
                    localStorage.setItem('group1', '');
                    localStorage.setItem('group2', '');
                    localStorage.setItem('students', []);
                    localStorage.setItem('lectors', []);
                    localStorage.setItem('groups', []);
                    
                    if (energy.length !== 0 && verticesOrder.find(x => x.id === energy.id + 'v')) {
                      filterData(getFilterData());
                      LoadSankeyData(loadData, filterData, setMinMax, setValue1, setMinMaxNode, setValue1Node, setNodes, energy, vertices);
                    }
                  }}>
                  {eventlog.name.length < 19 ? eventlog.name : eventlog.name.slice(0, 17) + "..."}
                </Typography>

                <Typography variant="caption" style={{ color: '#fff', textDecoration: 'underline', cursor: 'pointer' }} onClick={() =>
                    { document.getElementById('verticesInput').click(); selectedEventLogID = eventlog.id; }}>
                    {verticesOrder.find(x => x.id === eventlog.id + 'v') ? verticesOrder.find(x => x.id === eventlog.id + 'v').name : "Добавить порядок вершин"}
                    <input onChange={(e) => { parseVertices(e, selectedEventLogID) }} multiple={false} id="verticesInput" accept="text/csv" type='file' style={{ display: 'none' }} />
                </Typography>
                </Box>
                <Box>
                  <IconButton color='primary' aria-label="add an alarm" onClick={() => {tableData = <CSVDataTable data={eventLogs.filter((row) => row.id === eventlog.id)[0].data} />; setModalPageActive(true);}}>
                    <ShowIcon />
                  </IconButton>

                  <IconButton color="primary" onClick={() => {
                    setEventLogs(eventLogs.filter((row) => row.id !== eventlog.id));
                    setVerticesOrder(verticesOrder.filter((row) => row.id !== eventlog.id + 'v'));
                    localStorage.setItem('eventlogs', JSON.stringify(eventLogs.filter((row) => row.id !== eventlog.id)));
                    localStorage.setItem('vertices', JSON.stringify(verticesOrder.filter((row) => row.id !== eventlog.id + 'v')))}}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
                </Box>
              </div>
            )
          })}
        </div>

        </FormGroup>
        </Box>

        <Box m={2} pt={2}>
          <Button variant="text" onClick={() => { document.getElementById('eventlogInput').click();}}>Добавить журнал событий
          <input onChange={(e) => getEventLog(e)} multiple={false} id="eventlogInput" accept="text/csv" type='file' style={{ display: 'none' }}/>
          </Button>
        </Box>

        <Box m={2} pt={2}>
            <Typography variant="h8" style={{ color: '#fff' }}>Подмножества</Typography>
        <FormGroup>

        <div>
          {subsets.map(subset => {
            return (
              
              <div>
                <Box
                  component="span"
                  m={1}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >

                <Box display="flex" flexDirection="column" alignItems="left" p={1}>

                <Typography variant="h8" style={{ color: subset.id === activeEventLog.id ? "#42aaff" : '#fff', cursor: 'pointer' }} onClick={() => 
                  {setActiveEventLog(subset);
                    var eventlog = eventLogs.filter((row) => row.id === subset.eventlogID)[0];
                    energy = eventlog;
                    vertices = verticesOrder.filter((row) => row.id === eventlog.id+'v')[0];

                    localStorage.setItem('group1', subset.filters['group1']);
                    localStorage.setItem('group2', subset.filters['group2']);
                    localStorage.setItem('students', subset.filters['students']);
                    localStorage.setItem('lectors', subset.filters['lectors']);
                    localStorage.setItem('groups', subset.filters['groups']);
                    filterData(getFilterData());
                  }}>
                    {subset.name.length < 19 ? subset.name : subset.name.slice(0, 17) + "..."}
                </Typography>
                </Box>
                <Box>
                  <IconButton color='primary' aria-label="add an alarm" onClick={() => {}}>
                    <SaveIcon />
                  </IconButton>

                  <IconButton color="primary" onClick={() => {setSubsets(subsets.filter((row) => row.id !== subset.id));}}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
                </Box>
              </div>
            )
          })}
        </div>

        </FormGroup>
        </Box>

        <Box m={2} pt={2}>
          <Button variant="text" onClick={() => {createSubset()}}>Сформировать подмножество
          </Button>
        </Box>

            <Box sx={{ m: 3, pt: 3 }}>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={() => {SaveFilters()}}>Сохранить фильтры</Button>
            </Box>

            <Box sx={{ m: 3, mt: -1.5 }}>
              <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => {fileInput.current.click()}} color='success'>Загрузить фильтры
              <input onChange={(e) => handleChange(e)} multiple={false} ref={fileInput} accept="text/*" type='file' style={{ display: 'none' }}/>
              </Button>
            </Box>

            <Box sx={{ m: 2 }}>
              <Button variant="text" onClick={() => {
                if (energy.length !== 0 && verticesOrder.find(x => x.id === energy.id + 'v')) {
                  filterData(getFilterData())
                }}}>Применить фильтры</Button>
            </Box>
          </ul>
        </nav>


        <Box m={1} pt={3} position={'fixed'} top={45} right={5} display="flex" justifyContent="space-between"
          alignItems="flex-start">
        <FormGroup>
          <FormControlLabel control={<Checkbox
          checked={isChecked[0]}
          onChange={(e) => {
            isCheckboxChecked(0, e.target.checked)
            isCheckboxChecked(1, !e.target.checked)
            if (localStorage.getItem('group') === '0') {
              localStorage.setItem('group', 1);
            } else {
              localStorage.setItem('group', 0);
            }
          }}
          sx={{
            '&.Mui-checked': {
              color: "#42aaff",
            },
            }}
            />} label= {<Typography variant="h8">Первая подгруппа</Typography>} 
          />
            
            <FormControlLabel control={<Checkbox
            checked={isChecked[1]}
            onChange={(e) => {
              isCheckboxChecked(0, !e.target.checked)
              isCheckboxChecked(1, e.target.checked)
              if (localStorage.getItem('group') === '1') {
                localStorage.setItem('group', 0);
              } else {
                localStorage.setItem('group', 1);
              }
            }}
          sx={{
            '&.Mui-checked': {
              color: "#98fb98",
            },
            }}
            />} label= {<Typography variant="h8">Вторая подгруппа</Typography>} 
            />

        </FormGroup>
        <Button variant="contained" sx={{mt:1}} onClick={() => {
          if (energy.length !== 0 && verticesOrder.find(x => x.id === energy.id + 'v')) {
            filterData(getFilterData())
          }}}>Применить
        </Button>
        </Box>
      </IconContext.Provider>
        <Container maxWidth="xl">
          <Box sx={{ flexGrow: 1, mb: 5, mt: 18 }}>
          </Box>
          <Box sx={{ flexGrow: 1, height: "100%", width: "100%", ml: 12}}>
        <Grid item xs={12} spacing={3} marginTop={4}>
          {filteredData.length > 0 && <CallSankey data={filteredData} vertices={vertices}/>}
        </Grid>
      </Box>
    </Container>

    <ModalPage active={modalPageActive2} setActive={setModalPageActive2} data={tableData} />
    <ModalPage active={modalPageActive} setActive={setModalPageActive} data={tableData} />

    </div>
    
  )
}

export default VisualizationPage
