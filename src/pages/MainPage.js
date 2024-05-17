import * as React from 'react';
import { Link } from 'react-router-dom';

import { Box, Typography } from "@mui/material";
import { useState } from "react";
import Header from "../components/Header";
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import Papa from "papaparse";
import axios from 'axios';
import ModalPage from '../components/ModalPage/ModalPage';
import PasswordChangePage from '../components/PasswordChangePage';

import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from '@mui/x-data-grid';

const passwordChangePage = <PasswordChangePage />;
var initialRows = []

await axios.get('http://127.0.0.1:4000/projects/' + localStorage.getItem("id"))
  .then(response => response.data.forEach(element => {
      initialRows.push({
        id: element.id,
        name: element.name,
        description: element.description, 
        userID: element.userId,
        date: element.date, //new Date(2023, 10, 11, 9, 23).toLocaleString("ru", options),
        eventlogs: element.eventlogs,
        notes: element.notes,
        link: "/visualization"
      })
  }))
  .catch(function (error) {
    console.log("Ошибка загрузки проектов!")
  });

var id = initialRows.length > 0 ? Math.max(...initialRows.map(el => el.id)) : 0;

var options = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  timezone: 'UTC',
  hour: 'numeric',
  minute: 'numeric',
};

localStorage.setItem('group', 0);
localStorage.setItem('group1', '');
localStorage.setItem('group2', '');
localStorage.setItem('students', []);
localStorage.setItem('lectors', []);
localStorage.setItem('groups', []);

function EditToolbar(props) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    id += 1;

    setRows((oldRows) => [...oldRows, {
      id: id,
      name: '',
      description: '',
      userID: localStorage.getItem("id"),
      date: new Date().toLocaleString("ru", options),
      eventlogs: '',
      notes: '',
      link: "/visualization"
    }]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Создать новый проект
      </Button>
    </GridToolbarContainer>
  );
}

export default function FullFeaturedCrudGrid() {
  const [rows, setRows] = React.useState(initialRows);
  const [rowModesModel, setRowModesModel] = React.useState({});
  const [modalPageActive, setModalPageActive] = useState(false);

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDownloadClick = (id) => async () => {
    let files = await selectFile(".csv", true);

    Papa.parse(files[0], {
      complete: function(results) {
        console.log("Finished:", results.data);
      }
    });
  };

  const handleShowClick = (id) => async () => {
    const popup = window.open('', '_blank', 'width=600,height=400,scrollbars=yes');
    popup.document.write('<html><head><title>CSV Viewer</title></head><body>');
    popup.document.write('<h2>CSV Data</h2>');
    // popup.document.write(table.outerHTML);
    popup.document.write('</body></html>');
  };

  function selectFile (contentType, multiple){
    return new Promise(resolve => {
        let input = document.createElement('input');
        input.type = 'file';
        input.multiple = multiple;
        input.accept = contentType;

        input.onchange = _ => {
            let files = Array.from(input.files);
            if (multiple)
                resolve(files);
            else
                resolve(files[0]);
        };

        input.click();
    });
  };

  const handleDeleteClick = (id) => () => {
    var result = window.confirm("Вы действительно хотите удалить проект?");
    if (result) {
      axios.delete('http://127.0.0.1:4000/projects/' + id)
      .then(function (response) {
        setRows(rows.filter((row) => row.id !== id));
        initialRows = initialRows.filter((row) => row.id !== id);
      })
      .catch(function (error) {
        if (error.response.status === 404) {
          setRows(rows.filter((row) => row.id !== id));
        } else {
          alert("Ошибка удаления проекта!");
        }
      });
    }
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    if (newRow.name === "") {
      alert("Поле названия проекта не заполнено!")
      newRow.name = "project #" + newRow.id;
      updatedRow.name = "project #" + newRow.id;
    }  

    var formdata = new FormData();

    formdata.append("name", newRow.name);
    formdata.append("description", newRow.description);
    formdata.append("userId", localStorage.getItem("id"));
    formdata.append("date", rows.filter((row) => row.id === newRow.id)[0].date);
    formdata.append("eventlogs", newRow.eventlogs);
    formdata.append("notes", newRow.notes);

    if (initialRows.filter(el => el.id === newRow.id).length > 0) {
      axios.put('http://127.0.0.1:4000/projects/' + newRow.id, formdata)
      .then(function (response) {
      })
      .catch(function (error) {
        alert("Ошибка обновления проекта!");
      });
    } else {
      axios.post('http://127.0.0.1:4000/projects', formdata)
      .then(function (response) {
        initialRows = [...initialRows, { 
          id: newRow.id,
          name: newRow.name,
          description: newRow.description, 
          userID: localStorage.getItem("id"),
          date: rows.filter((row) => row.id === newRow.id)[0].date,
          eventlogs: newRow.eventlogs,
          notes: newRow.notes,
          link: "/visualization"
        }];
      })
      .catch(function (error) {
        alert("Ошибка добавления проекта!");
      });
    }

    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns = [
    {
      field: "name",
      headerName: "Название проекта",
      flex: 1,
      cellClassName: "name-column--cell",
      editable: true,
      renderCell: (cellValues) => {
        return (
        <Link to={cellValues.row.link} onClick={() => {
          localStorage.setItem('projectName', cellValues.row.name);
          localStorage.setItem('notes', cellValues.row.notes);
          localStorage.setItem('projectID', cellValues.row.id)}}>
          {cellValues.row.name}
        </Link>
        );
      }
    },
    {
      field: "description",
      headerName: "Описание",
      flex: 1,
      editable: true,
    },
    {
      field: "date",
      headerName: "Дата создания",
      flex: 1,
    },
    {
      field: 'edit',
      type: 'actions',
      headerName: 'Редактировать',
      flex: 1,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={
              handleDeleteClick(id)
            }
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
        <Box m="20px">
      <Header title="Название приложения" subtitle="Описание приложения" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#e0dcdc",
            borderBottom: "none",
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: "#e0dcdc",
          },
        }}
      >
              <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{
          toolbar: EditToolbar,
        }}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            flexDirection: "column",
            p: 0.5,
            m: 0.5,
          }}
        >
          <Typography variant="caption" color="#B6B6B6">
            @Место для текста
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            flexDirection: "column",
            p: 0.5,
            m: 0.5,
          }}
        >
          <Button variant="text" onClick={() => setModalPageActive(true)}>Сменить пароль</Button>
          <Button variant="text" color="error"
          onClick={() => {
            var result = window.confirm("Вы действительно хотите удалить аккаунт?");
            if (result) {
              var projectsID = []
              axios.get('http://127.0.0.1:4000/projects/' + localStorage.getItem("id"))
              .then(response => {response.data.forEach(element => {
                projectsID.push(element.id)
              });
                projectsID.forEach(element => {
                  axios.delete('http://127.0.0.1:4000/projects/' + element)
                  .then(function (response) {
                    setRows(rows.filter((row) => row.id !== element));
                    initialRows = initialRows.filter((row) => row.id !== element);
                  })
                  .catch(function (error) {
                    if (error.response.status === 404) {
                      setRows(rows.filter((row) => row.id !== element));
                    } else {
                      alert("Ошибка удаления проекта!");
                    }
                  });
                });

                axios.delete('http://127.0.0.1:4000/users/' + localStorage.getItem("id"))
                  .then(function (response) {
                    window.location.replace("http://localhost:3000/");
                  })
                  .catch(function (error) {
                    alert("Ошибка удаления аккаунта!");
                  });
              })
              .catch(function (error) {
                console.log("Ошибка плоучения списка проектов!")
              });
          }}}>Удалить аккаунт</Button>
        </Box>
      </Box>
      </Box>
      <ModalPage active={modalPageActive} setActive={setModalPageActive} data={passwordChangePage} />
    </Box>
  );
}