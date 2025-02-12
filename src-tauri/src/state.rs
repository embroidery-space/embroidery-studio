use std::collections::HashMap;
use std::path::PathBuf;

use borsh::{BorshDeserialize, BorshSerialize};
use serde::{Deserialize, Serialize};

use crate::core::history::History;
use crate::core::pattern::PatternProject;

#[derive(Debug, Hash, PartialEq, Eq, Clone, Serialize, Deserialize, BorshSerialize, BorshDeserialize)]
#[repr(transparent)]
pub struct PatternKey(String);

impl AsRef<str> for PatternKey {
  fn as_ref(&self) -> &str {
    &self.0
  }
}

impl From<&str> for PatternKey {
  fn from(value: &str) -> Self {
    Self(value.to_string())
  }
}

impl From<&PathBuf> for PatternKey {
  fn from(value: &PathBuf) -> Self {
    Self(value.to_string_lossy().to_string())
  }
}

pub struct HistoryStateInner<R: tauri::Runtime> {
  inner: HashMap<PatternKey, History<R>>,
}

impl<R: tauri::Runtime> HistoryStateInner<R> {
  pub fn get(&self, key: &PatternKey) -> Option<&History<R>> {
    self.inner.get(key)
  }

  pub fn get_mut(&mut self, key: &PatternKey) -> &mut History<R> {
    self.inner.entry(key.clone()).or_default()
  }
}

impl<R: tauri::Runtime> Default for HistoryStateInner<R> {
  fn default() -> Self {
    Self { inner: HashMap::new() }
  }
}

pub type PatternsState = std::sync::RwLock<HashMap<PatternKey, PatternProject>>;
pub type HistoryState<R> = std::sync::RwLock<HistoryStateInner<R>>;
