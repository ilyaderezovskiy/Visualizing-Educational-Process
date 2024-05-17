import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

export default function MultipleSelectCheckmarks(type) {
  const [personName, setPersonName] = React.useState([]);

  var lectors = [];
  var students = [];
  var groups = [];
  var names = [];

  // Загрузка параметров фильтрации 
  try {
    lectors = type.data.map(function(item){return item.lector;}).filter((item, i, ar) => ar.indexOf(item) === i);
    students = type.data.map(function(item){return item.student;}).filter((item, i, ar) => ar.indexOf(item) === i);
    groups = type.data.map(function(item){return item.group;}).filter((item, i, ar) => ar.indexOf(item) === i);
  } catch {

  }

  // Выбор активного фильтра
  if (type.type === 'lectors') {
    names = lectors;
  } else if (type.type === 'students') {
    names = students;
  } else {
    names = groups;
  }

  // Отображение информации при отсутствии параметра для фильтрации
  if (names.length === 1) {
    names = [];
    return (
      <div>
        <Typography variant="caption" color="#ff0000" p="15px">
            Заданный параметр отсутствует
        </Typography>
      </div>
    )
  }

  return (
    <div>
      <FormControl sx={{ ml: 3, width: 300 }} size='small'>
        <Autocomplete
          multiple
          limitTags={1}
          id="fixed-tags-demo"
          value={personName}
          onChange={(event, newValue) => {
            setPersonName([
              ...newValue,
            ]);
            localStorage.setItem(type.type, newValue);
          }}
          options={names}
          getOptionLabel={(option) => option}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => (
              <Chip
                label={option}
                {...getTagProps({ index })}
              />
            ))
          }
          style={{backgroundColor: "#ffff"}} 
          renderInput={(params) => (
            <TextField {...params} label="Выбрать" variant="outlined" />
          )}
        />
      </FormControl>
    </div>
  );
}
