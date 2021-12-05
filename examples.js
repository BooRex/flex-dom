import { c, app, useState } from './index.js';

/**
 * Example of functional components
 */

const Input = ({ name = '', value, onChange }) => {
  return c('input', [], {
    onInput: e => onChange(e.target.name, e.target.value),
    value,
    name
  });
};

const Hobbies = ({ hobbies = [], setForm }) => {
  return c('div', hobbies.map((hobby, index) => {
    const onChange = (name, value) => {
      setForm(form => {
        const currentHobbies = [...form.hobbies];
        currentHobbies[index] = { ...currentHobbies[index], value: value };

        return { ...form, hobbies: currentHobbies };
      }, true);
    };

    return Input({
      value: hobby.value,
      onChange
    });
  }));
};

const defaultHobby = {
  value: ''
};

const defaultFormState = {
  name: '',
  surName: '',
  hobbies: []
};

const Form = () => {
  const [setForm, connectToForm] = useState(defaultFormState);

  const onChange = (name, value) => {
    setForm(form => ({ ...form, [name]: value }), true);
  };
  const onAdd = () => {
    setForm(form => ({ ...form, hobbies: [...form.hobbies, defaultHobby] }));
  };

  return c('div', [
    c('div', 'text'),
    connectToForm(Input, formState => ({ value: formState.name }), {
      name: 'name', onChange
    }),
    connectToForm(Input, formState => ({ value: formState.surName }), {
      name: 'surName', onChange
    }),
    connectToForm(Hobbies, formState => ({ hobbies: formState.hobbies }), { setForm }),
    c('button',
      'Add new', {
        onClick: onAdd,
      })
  ]);
};

const Text = ({ count }) => {
  return c('h1', count, {
    className: 'text',
  });
};

const CatsList = ({ cats }) => {
  return c('div', cats.map(cat => {
    return c('img', [], {
      src: cat.url,
      alt: cat.id
    });
  }), {
    className: 'cats-list'
  });
};

/**
 * Example of page layout with different examples of use
 */

const PageLayout = () => {
  return c('div', [
    ExampleWithForm(),
    ExampleWithCats(),
  ], {
    className: 'layout'
  });
};

const ExampleWithForm = () => {
  return c('div', [
    c('h2', 'Example with form'),
    Form()
  ], {
    className: 'home-page'
  });
};

const ExampleWithCats = () => {
  const [setCount, connectToCount] = useState(2);
  const [setCats, connectToCats] = useState([]);

  const onChange = (name, value) => {
    if (!value) {
      return;
    }

    setCount(value);

    fetch(`https://api.thecatapi.com/v1/images/search?limit=${value}&size=full&sub_id=demo-e17b0`)
    .then(r => r.json()).then(catsData => {
      setCats(catsData);
    });
  };

  return c('div', [
    c('h2', 'Example with cats and fetch'),
    Input({ value: 2, onChange }),
    connectToCount(Text, state => ({ count: state })),
    connectToCats(CatsList, state => ({ cats: state }))
  ], {
    className: 'home-page'
  });
};

/**
 * App initialization
 */
app('#root', PageLayout);

