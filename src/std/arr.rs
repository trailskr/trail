use ::core::default::Default;
use ::std::vec::Vec;

pub struct Arr<T>(Vec<T>);

impl<T> Arr<T> {
    pub fn new() -> Self {
        Self(Vec::new())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }
}

impl<T> Default for Arr<T> {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn should_create_new_array() {
        let arr = Arr::<i32>::new();

        #[allow(clippy::len_zero)]
        {
            assert!(arr.len() == 0);
        }
        assert!(arr.is_empty());
    }
}
